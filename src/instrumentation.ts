export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startDocumentExpirationJob } = await import(
      "@/src/shared/jobs/document-expiration-job"
    );
    startDocumentExpirationJob();
  }
}






