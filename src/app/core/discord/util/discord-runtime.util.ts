export function isDiscordActivityRuntime(): boolean {
  const searchParams = new URLSearchParams(
    window.location.search,
  );

  return (
    searchParams.has('frame_id') &&
    searchParams.has('instance_id')
  );
}