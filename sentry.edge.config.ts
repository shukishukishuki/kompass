import * as Sentry from "@sentry/nextjs";

// Edge Runtime 側は非公開DSNが設定されている場合のみ有効化する
const dsn = process.env.SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
  });
}
