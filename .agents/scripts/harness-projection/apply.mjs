const traceKey = (trace) =>
  ("contribution" in trace
    ? [
        trace.contextPlanVersion,
        "contribution",
        trace.scopeId,
        trace.contribution.id,
        trace.contribution.version,
        trace.adapter.id,
        trace.adapter.version,
        trace.matrixVersion,
      ]
    : [
        trace.contextPlanVersion,
        "application",
        trace.operation,
        trace.adapter.id,
        trace.adapter.version,
        trace.matrixVersion,
      ]
  ).join("\u0000");

const projectionState = (summary) =>
  summary._tag === "HarnessProjectionFailure"
    ? {
        applied: summary.completed,
        omissions: summary.omissions,
        errors: [...summary.errors],
      }
    : {
        applied: summary.applied,
        omissions: summary._tag === "HarnessProjectionPartial" ? summary.omissions : [],
        errors: [],
      };

export async function applyProjection({ projection, filesystem }) {
  const state = projectionState(projection.summary);
  const failed = new Set();

  for (const action of projection.actions) {
    try {
      await filesystem.apply(action);
    } catch (error) {
      failed.add(traceKey(action.trace));
      state.errors.push({
        _tag: "HarnessApplicationFailureError",
        trace: action.trace,
        action: action.id,
        message: error instanceof Error ? error.message : "Application failed",
      });
    }
  }

  if (state.errors.length > 0) {
    return {
      _tag: "HarnessProjectionFailure",
      completed: state.applied.filter(({ trace }) => !failed.has(traceKey(trace))),
      omissions: state.omissions,
      errors: state.errors,
    };
  }

  return projection.summary;
}
