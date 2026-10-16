export function cameraExternaIndisponivel(error) {
  const detail = `${error?.code || ''} ${error?.message || error || ''} ${error?.cause?.message || error?.cause || ''}`;
  return /ERR_MISSING_ACTIVITY_TO_HANDLE_INTENT|Failed to resolve activity to handle the intent|ActivityNotFoundException|No Activity found to handle Intent/i.test(detail);
}
