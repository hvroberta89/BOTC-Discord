import type {
  VercelRequest,
  VercelResponse,
} from '@vercel/node';

interface DiscordTokenResponse {
  access_token?: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  error?: string;
  error_description?: string;
}

export default async function handler(
  request: VercelRequest,
  response: VercelResponse,
): Promise<void> {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');

    response.status(405).json({
      message: 'Method not allowed.',
    });

    return;
  }

  const discordClientId =
    process.env.DISCORD_CLIENT_ID;

  const discordClientSecret =
    process.env.DISCORD_CLIENT_SECRET;

  if (!discordClientId || !discordClientSecret) {
    response.status(500).json({
      message:
        'Discord OAuth environment variables are missing.',
    });

    return;
  }

  const code =
    typeof request.body?.code === 'string'
      ? request.body.code
      : null;

  if (!code) {
    response.status(400).json({
      message: 'Authorization code is required.',
    });

    return;
  }

  try {
    const tokenResponse = await fetch(
      'https://discord.com/api/oauth2/token',
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: discordClientId,
          client_secret: discordClientSecret,
          grant_type: 'authorization_code',
          code,
        }),
      },
    );

    const tokenData =
      (await tokenResponse.json()) as DiscordTokenResponse;

    if (
      !tokenResponse.ok ||
      !tokenData.access_token
    ) {
      console.error(
        'Discord token exchange failed:',
        tokenData,
      );

      response.status(tokenResponse.status).json({
        message:
          tokenData.error_description ??
          tokenData.error ??
          'Discord token exchange failed.',
      });

      return;
    }

    response.status(200).json({
      access_token: tokenData.access_token,
    });
  } catch (error: unknown) {
    console.error(
      'Discord token endpoint failed:',
      error,
    );

    response.status(500).json({
      message:
        error instanceof Error
          ? error.message
          : 'Discord token endpoint failed.',
    });
  }
}