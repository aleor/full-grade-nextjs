export default async function onError(error, req, res, next) {
  console.error(error);
  res.status(500).end();
}
