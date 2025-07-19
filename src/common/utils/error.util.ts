export function formatError(error: any): { message: string; details?: any } {
  if (typeof error === "string") return { message: error };
  if (error instanceof Error)
    return { message: error.message, details: error.stack };
  return { message: "Unknown error", details: error };
}
