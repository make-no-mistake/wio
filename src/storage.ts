export function getS3Path(site: string, file: string) {
  return `site_files/${site}/${file}`;
}
