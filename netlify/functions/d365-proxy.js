const fetch = require('node-fetch'); // Required for older node, or use global fetch in Node 18+

exports.handler = async (event, context) => {
  // CORS Headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  try {
    const { action, data } = JSON.parse(event.body);

    // Microsoft Dynamics 365 Config (Set these in Netlify UI)
    const TENANT_ID = process.env.D365_TENANT_ID;
    const CLIENT_ID = process.env.D365_CLIENT_ID;
    const CLIENT_SECRET = process.env.D365_CLIENT_SECRET;
    const RESOURCE = process.env.D365_RESOURCE; // e.g. https://your-org.api.crm4.dynamics.com

    // 1. Get Access Token
    const tokenResponse = await fetch(`https://login.microsoftonline.com/${TENANT_ID}/oauth2/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        resource: RESOURCE
      })
    });
    const tokenData = await tokenResponse.json();
    const token = tokenData.access_token;

    // 2. Proxy to D365
    let endpoint = '';
    let method = 'GET';

    switch(action) {
      case 'getProfile':
        endpoint = `/api/data/v9.2/contacts?$filter=mobilephone eq '${data.phone}'`;
        break;
      case 'updateProfile':
        endpoint = `/api/data/v9.2/contacts(${data.id})`;
        method = 'PATCH';
        break;
      case 'getTickets':
        endpoint = `/api/data/v9.2/dislog_tickets?$filter=_contactid_value eq ${data.id}`;
        break;
      default:
        throw new Error('Action non reconnue');
    }

    const d365Response = await fetch(`${RESOURCE}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: method !== 'GET' ? JSON.stringify(data.body) : null
    });

    const result = await d365Response.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(result)
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
