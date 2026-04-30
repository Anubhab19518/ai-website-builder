/**
 * @module registry
 *
 * Public barrel for the component registry.
 */

export {
  componentRegistry,
  getRegistryEntry,
  getRegisteredTypes,
  getCompressedSchema,
} from "./componentRegistry";

export type { ComponentEntry, PropSchema, ComponentType_t } from "./componentRegistry";

export {
  validateProps,
  formatValidationResult,
} from "./propValidator";

export type {
  ValidationResult,
  ValidationError,
  ValidationWarning,
} from "./propValidator";
