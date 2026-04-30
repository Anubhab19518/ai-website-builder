/**
 * @module src/agents
 *
 * Public barrel for the agent system.
 *
 * Import order follows the graph pipeline:
 *   state → planner → nodes → graph
 */

// State
export { AgentStateAnnotation, MessagesAnnotation } from "./state";
export type { AgentState, GraphState } from "./state";

// Nodes
export { plannerNode } from "./planner";
export { humanApprovalNode } from "./nodes/humanApproval";
export { layoutExecutorNode } from "./nodes/layoutExecutor";
export { humanLayoutFeedbackNode } from "./nodes/humanLayoutFeedback";
export { contentExecutorNode } from "./nodes/contentExecutor";
export { humanContentFeedbackNode } from "./nodes/humanContentFeedback";
export { validatorNode } from "./nodes/validator";
export { refinerNode } from "./nodes/refiner";
export { humanFinalFeedbackNode } from "./nodes/humanFinalFeedback";
export type { ApprovalPayload } from "./nodes/humanApproval";
export type { LayoutApprovalPayload } from "./nodes/humanLayoutFeedback";
export type { ContentApprovalPayload } from "./nodes/humanContentFeedback";
export type { FinalApprovalPayload } from "./nodes/humanFinalFeedback";

// Graph (compiled)
export { agentGraph, buildGraphConfig } from "./graph";
