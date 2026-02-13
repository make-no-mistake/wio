interface SDKTranspilationResult {
  /**
   * The transpiled SDK code. This can be served directly to the browser.
   */
  body?: string;

  /**
   * Whether the transpilation was successful.
   */
  success: boolean;

  /**
   * The error message if the transpilation failed.
   */
  error?: string;
}

export async function transpileSDK(): Promise<SDKTranspilationResult> {
  try {
    const result = await Bun.build({
      entrypoints: [import.meta.dir + "/_index.ts"],
    });

    if (result.success && result.outputs[0]) {
      return traspilationSuccessResult(result);
    } else {
      return traspilationFailureResult("Unable to transpile SDK.");
    }
  } catch (error) {
    return traspilationFailureResult(String(error));
  }
}

function traspilationFailureResult(error: string): SDKTranspilationResult {
  return {
    success: false,
    error: error,
  };
}

async function traspilationSuccessResult(
  result: Bun.BuildOutput,
): Promise<SDKTranspilationResult> {
  return {
    success: true,
    body: await result.outputs[0]!.text(),
  };
}
