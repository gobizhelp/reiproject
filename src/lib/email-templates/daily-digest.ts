import type { MatchedProperty } from '../matching';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://reireach.com';

function formatPrice(price: number | null): string {
  if (price == null) return 'N/A';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(price);
}

function propertyCard(match: MatchedProperty): string {
  const p = match.property;
  const photo = p.property_photos?.[0];
  const photoHtml = photo
    ? `<img src="${photo.url}" alt="${p.street_address}" style="width:100%;height:180px;object-fit:cover;border-radius:8px 8px 0 0;" />`
    : `<div style="width:100%;height:180px;background:#1a1a2e;border-radius:8px 8px 0 0;display:flex;align-items:center;justify-content:center;color:#666;font-size:14px;">No Photo</div>`;

  const details = [
    p.beds != null ? `${p.beds} bd` : null,
    p.baths != null ? `${p.baths} ba` : null,
    p.sqft != null ? `${p.sqft.toLocaleString()} sqft` : null,
  ]
    .filter(Boolean)
    .join(' &middot; ');

  const matchReasons = match.matchedBuyBoxes[0].reasons.join(', ');

  return `
    <div style="background:#16162a;border:1px solid #2a2a4a;border-radius:8px;overflow:hidden;margin-bottom:16px;">
      ${photoHtml}
      <div style="padding:16px;">
        <div style="font-size:18px;font-weight:bold;color:#ffffff;margin-bottom:4px;">
          ${formatPrice(p.asking_price)}
        </div>
        <div style="font-size:14px;color:#cccccc;margin-bottom:4px;">
          ${p.street_address}, ${p.city}, ${p.state} ${p.zip_code}
        </div>
        <div style="font-size:13px;color:#999999;margin-bottom:8px;">
          ${details || 'Details not available'}
        </div>
        ${p.property_type ? `<div style="font-size:12px;color:#999999;margin-bottom:8px;">${p.property_type}</div>` : ''}
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:12px;">
          <span style="background:#7c3aed;color:white;font-size:11px;font-weight:600;padding:3px 8px;border-radius:12px;">
            ${match.bestScore}% match
          </span>
          <span style="font-size:11px;color:#999999;">
            ${matchReasons}
          </span>
        </div>
        <a href="${APP_URL}/listings/${p.slug}" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:8px 20px;border-radius:6px;font-size:13px;font-weight:600;">
          View Deal
        </a>
      </div>
    </div>
  `;
}

export function buildDailyDigestHtml(
  buyerName: string | null,
  matches: MatchedProperty[],
): string {
  const greeting = buyerName ? `Hi ${buyerName},` : 'Hi there,';
  const count = matches.length;

  const listingsHtml = matches
    .slice(0, 10) // Cap at 10 listings per email
    .map(propertyCard)
    .join('');

  const moreText =
    count > 10
      ? `<p style="text-align:center;color:#999999;font-size:14px;margin:16px 0;">
          And ${count - 10} more matching listings.
          <a href="${APP_URL}/buyer/matches" style="color:#7c3aed;text-decoration:underline;">View all matches</a>
        </p>`
      : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Daily Deal Digest</title>
</head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <!-- Header -->
    <div style="text-align:center;padding:24px 0;border-bottom:1px solid #2a2a4a;margin-bottom:24px;">
      <h1 style="margin:0;font-size:24px;color:#ffffff;">REI Reach</h1>
      <p style="margin:4px 0 0;font-size:14px;color:#999999;">Your Daily Deal Digest</p>
    </div>

    <!-- Greeting -->
    <p style="font-size:16px;color:#cccccc;margin-bottom:4px;">${greeting}</p>
    <p style="font-size:14px;color:#999999;margin-bottom:24px;">
      ${count === 1
        ? 'We found <strong style="color:#7c3aed;">1 new listing</strong> matching your buy box criteria.'
        : `We found <strong style="color:#7c3aed;">${count} new listings</strong> matching your buy box criteria.`
      }
    </p>

    <!-- Listings -->
    ${listingsHtml}
    ${moreText}

    <!-- CTA -->
    <div style="text-align:center;margin:32px 0;">
      <a href="${APP_URL}/buyer/matches" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        View All Matches
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid #2a2a4a;padding-top:24px;text-align:center;">
      <p style="font-size:12px;color:#666666;margin:0;">
        You're receiving this because you enabled daily digest emails.
      </p>
      <p style="font-size:12px;color:#666666;margin:4px 0 0;">
        <a href="${APP_URL}/settings" style="color:#7c3aed;text-decoration:underline;">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function buildNoMatchesHtml(buyerName: string | null): string {
  const greeting = buyerName ? `Hi ${buyerName},` : 'Hi there,';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your Daily Deal Digest</title>
</head>
<body style="margin:0;padding:0;background:#0d0d1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:24px 16px;">
    <div style="text-align:center;padding:24px 0;border-bottom:1px solid #2a2a4a;margin-bottom:24px;">
      <h1 style="margin:0;font-size:24px;color:#ffffff;">REI Reach</h1>
      <p style="margin:4px 0 0;font-size:14px;color:#999999;">Your Daily Deal Digest</p>
    </div>

    <p style="font-size:16px;color:#cccccc;margin-bottom:4px;">${greeting}</p>
    <p style="font-size:14px;color:#999999;margin-bottom:24px;">
      No new listings matched your buy box criteria today. We'll keep looking and let you know when something comes up!
    </p>

    <div style="text-align:center;margin:32px 0;">
      <a href="${APP_URL}/buyer/matches" style="display:inline-block;background:#7c3aed;color:white;text-decoration:none;padding:12px 32px;border-radius:8px;font-size:15px;font-weight:600;">
        Browse All Listings
      </a>
    </div>

    <div style="border-top:1px solid #2a2a4a;padding-top:24px;text-align:center;">
      <p style="font-size:12px;color:#666666;margin:0;">
        You're receiving this because you enabled daily digest emails.
      </p>
      <p style="font-size:12px;color:#666666;margin:4px 0 0;">
        <a href="${APP_URL}/settings" style="color:#7c3aed;text-decoration:underline;">Manage email preferences</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}
