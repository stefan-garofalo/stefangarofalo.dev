const nonEmptyString = (value, fallback = "unknown") =>
  typeof value === "string" && value.length > 0 ? value : fallback;

const adapterIdentity = (matrix) => ({
  id: nonEmptyString(matrix?.adapter?.id),
  version: nonEmptyString(matrix?.adapter?.version),
});

const traceFor = ({ adapter, contextPlan, scope, contribution }) => ({
  contextPlanVersion: nonEmptyString(contextPlan?.version),
  scopeId: nonEmptyString(scope?.id),
  contribution: {
    id: nonEmptyString(contribution?.identity?.id, "context-plan"),
    version: nonEmptyString(contribution?.identity?.version),
  },
  adapter: adapterIdentity(adapter?.matrix),
  matrixVersion: nonEmptyString(adapter?.matrix?.matrixVersion),
});

const capabilityFamilies = [
  "skill",
  "scoped-prompt",
  "lifecycle-hook",
  "tool-configuration",
  "subagent-template",
];

const isObject = (value) => typeof value === "object" && value !== null && !Array.isArray(value);

const capabilityRowIssue = (row) => {
  const allowedKeys =
    row.support === "supported" ? ["family", "support"] : ["family", "support", "reason"];
  if (Object.keys(row).some((key) => !allowedKeys.includes(key))) {
    return `Adapter matrix capability for ${row.family} has unexpected fields`;
  }
  if (row.support === "supported") {
    return undefined;
  }
  if (
    (row.support === "degraded" || row.support === "unsupported") &&
    typeof row.reason === "string" &&
    row.reason.length > 0
  ) {
    return undefined;
  }
  return `Adapter matrix capability for ${row.family} has invalid support`;
};

const validateCapabilityMatrix = (matrix) => {
  const metadataIssues = [];
  if (!isObject(matrix)) {
    metadataIssues.push("Adapter matrix must be an object");
  } else {
    if (typeof matrix.matrixVersion !== "string" || matrix.matrixVersion.length === 0) {
      metadataIssues.push("Adapter matrix version must be a non-empty string");
    }
    if (!isObject(matrix.adapter)) {
      metadataIssues.push("Adapter identity must be an object");
    } else {
      if (typeof matrix.adapter.id !== "string" || matrix.adapter.id.length === 0) {
        metadataIssues.push("Adapter id must be a non-empty string");
      }
      if (typeof matrix.adapter.version !== "string" || matrix.adapter.version.length === 0) {
        metadataIssues.push("Adapter version must be a non-empty string");
      }
    }
  }
  if (!isObject(matrix) || !Array.isArray(matrix.capabilities)) {
    return {
      capabilities: new Map(),
      globalIssue: [...metadataIssues, "Adapter matrix capabilities must be an array"].join("; "),
    };
  }

  const unknownRows = matrix.capabilities.filter(
    (row) => !isObject(row) || !capabilityFamilies.includes(row.family),
  );
  if (unknownRows.length > 0) {
    return {
      capabilities: new Map(),
      globalIssue: [
        ...metadataIssues,
        "Adapter matrix contains an unknown or malformed capability row",
      ].join("; "),
    };
  }

  const familyIssues = new Map();
  const validRows = [];
  for (const family of capabilityFamilies) {
    const rows = matrix.capabilities.filter((row) => row.family === family);
    if (rows.length !== 1) {
      familyIssues.set(
        family,
        `Adapter matrix must contain exactly one capability for ${family}; found ${rows.length}`,
      );
      continue;
    }

    const issue = capabilityRowIssue(rows[0]);
    if (issue === undefined) {
      validRows.push(rows[0]);
    } else {
      familyIssues.set(family, issue);
    }
  }

  const globalIssue = [...metadataIssues, ...familyIssues.values()].join("; ") || undefined;
  return {
    capabilities:
      globalIssue === undefined ? new Map(validRows.map((row) => [row.family, row])) : new Map(),
    globalIssue,
  };
};

export function project({ adapter, contextPlan }) {
  const { capabilities, globalIssue } = validateCapabilityMatrix(adapter.matrix);
  const actions = [];
  const applied = [];
  const omissions = [];
  const errors = [];
  let contributionCount = 0;

  for (const scope of contextPlan.scopes) {
    for (const contribution of scope.contributions) {
      contributionCount += 1;
      const capability = capabilities.get(contribution.kind);
      const trace = traceFor({ adapter, contextPlan, scope, contribution });

      if (globalIssue !== undefined) {
        errors.push({
          _tag: "InvalidHarnessProjectionError",
          trace,
          message: globalIssue,
        });
        continue;
      }

      if (capability.support === "unsupported") {
        omissions.push({
          _tag: "HarnessProjectionOmission",
          support: "unsupported",
          trace,
          warning: {
            _tag: "UnsupportedHarnessCapabilityWarning",
            family: contribution.kind,
            reason: capability.reason,
          },
        });
        continue;
      }

      let projected;
      try {
        projected = adapter.project({ scopeId: scope.id, contribution, capability });
      } catch (error) {
        errors.push({
          _tag: "HarnessAdapterDefectError",
          trace,
          message: error instanceof Error ? error.message : "Adapter defect",
        });
        continue;
      }

      if (
        !Array.isArray(projected) ||
        projected.length === 0 ||
        projected.some(
          (action) =>
            typeof action !== "object" ||
            action === null ||
            typeof action.id !== "string" ||
            action.id.length === 0,
        )
      ) {
        errors.push({
          _tag: "InvalidHarnessProjectionError",
          trace,
          message: "Adapter must return at least one identified action",
        });
        continue;
      }

      actions.push(...projected.map((action) => ({ ...action, trace })));
      applied.push({
        _tag: "HarnessProjectionApplied",
        support: capability.support,
        trace,
        ...(capability.support === "degraded" ? { reason: capability.reason } : {}),
      });
    }
  }

  if (globalIssue !== undefined && contributionCount === 0) {
    errors.push({
      _tag: "InvalidHarnessProjectionError",
      trace: traceFor({ adapter, contextPlan }),
      message: globalIssue,
    });
  }

  return {
    actions,
    summary:
      errors.length > 0
        ? { _tag: "HarnessProjectionFailure", completed: applied, omissions, errors }
        : omissions.length === 0
          ? { _tag: "HarnessProjectionSuccess", applied }
          : { _tag: "HarnessProjectionPartial", applied, omissions },
  };
}
