export interface RpcEnvelope<TPayload = unknown> {
  requestId: string;
  type: string;
  payload: TPayload;
}

type PendingEntry = {
  resolve: (value: any) => void;
  reject: (reason?: unknown) => void;
};


export function createWorkerRpcClient(worker: Worker) {
  const pending = new Map<string, PendingEntry>();
  let counter = 0;

  worker.onmessage = (event: MessageEvent<RpcEnvelope>) => {
    const { requestId, type, payload } = event.data;
    const entry = pending.get(requestId);
    if (!entry) return; 

    pending.delete(requestId);

    if (type === "error") {
      entry.reject(payload);
    } else {
      entry.resolve(payload);
    }
  };

  worker.onerror = (event) => {
    pending.forEach((entry) => entry.reject(event));
    pending.clear();
  };

  function call<TPayload = unknown, TResult = unknown>(
    type: string,
    payload?: TPayload,
  ): Promise<TResult> {
    const requestId = `${type}-${++counter}-${Date.now()}`;

    return new Promise<TResult>((resolve, reject) => {
      pending.set(requestId, { resolve, reject });
      worker.postMessage({ requestId, type, payload } satisfies RpcEnvelope);
    });
  }

  function terminate() {
    pending.forEach((entry) => entry.reject(new Error("Worker terminated")));
    pending.clear();
    worker.terminate();
  }

  return { call, terminate };
}

export function createWorkerRpcServer(
  handlers: Record<string, (payload: any) => any | Promise<any>>,
) {
  self.onmessage = async (event: MessageEvent<RpcEnvelope>) => {
    const { requestId, type, payload } = event.data;
    const handler = handlers[type];

    if (!handler) {
      (self as unknown as Worker).postMessage({
        requestId,
        type: "error",
        payload: `No handler registered for message type "${type}"`,
      });
      return;
    }

    try {
      const result = await handler(payload);
      (self as unknown as Worker).postMessage({
        requestId,
        type: "success",
        payload: result,
      });
    } catch (error) {
      (self as unknown as Worker).postMessage({
        requestId,
        type: "error",
        payload: error instanceof Error ? error.message : String(error),
      });
    }
  };
}
