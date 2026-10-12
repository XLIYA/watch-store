import { cloudHandler } from '../../../../server/cloud-handler';

export const config = { api: { bodyParser: false, responseLimit: '4mb' } };

/** مسیرهای عمومی API به همین دامنه بازنویسی می‌شوند تا کوکی refresh در /auth و کوکی پنل روی فروشگاه باقی بمانند. */
export default function handler(req, res) {
  const { path, ...query } = req.query;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    for (const item of Array.isArray(value) ? value : [value]) params.append(key, item);
  }
  req.url = '/' + path.map(encodeURIComponent).join('/') + (params.size ? '?' + params : '');
  req.query = query;
  return cloudHandler(req, res);
}
