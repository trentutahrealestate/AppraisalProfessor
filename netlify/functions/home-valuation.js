// netlify/functions/home-valuation.js
//
// Serverless function that calls RentCast's AVM value-estimate endpoint.
// The API key lives ONLY in the Netlify environment variable RENTCAST_API_KEY —
// it is never hardcoded here, and never sent to the browser.
//
// Set up the env var in Netlify: Site settings > Environment variables >
// Add a variable named RENTCAST_API_KEY with your (rotated) API key as the value.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Valuation service is not configured.' }),
    };
  }

  let address;
  try {
    const parsed = JSON.parse(event.body || '{}');
    address = (parsed.address || '').trim();
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid request body.' }),
    };
  }

  if (address.length < 8) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Enter a full street address, including city and state.' }),
    };
  }

  try {
    const url = `https://api.rentcast.io/v1/avm/value?address=${encodeURIComponent(address)}`;
    const rentcastResponse = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Api-Key': apiKey,
        Accept: 'application/json',
      },
    });

    if (!rentcastResponse.ok) {
      const status = rentcastResponse.status;
      const bodyText = await rentcastResponse.text();
      console.error('RentCast request failed:', status, bodyText);

      const message =
        status === 404
          ? "We couldn't find that address. Double-check it and try again."
          : 'The valuation service is temporarily unavailable. Please try again shortly.';
      return { statusCode: status, body: JSON.stringify({ error: message }) };
    }

    const data = await rentcastResponse.json();

    return {
      statusCode: 200,
      body: JSON.stringify({
        price: data.price ?? null,
        priceRangeLow: data.priceRangeLow ?? null,
        priceRangeHigh: data.priceRangeHigh ?? null,
        compCount: Array.isArray(data.comparables) ? data.comparables.length : 0,
        formattedAddress: data.subjectProperty?.formattedAddress ?? address,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Something went wrong retrieving the estimate. Please try again.' }),
    };
  }
};
