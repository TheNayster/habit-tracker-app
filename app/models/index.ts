// ✅ models/index.ts
export * from "./RootStore"
export * from "./HabitModel"
export * from "./HabitStore"
export * from "./UserStore"
export * from "./helpers/useStores"
export * from "./helpers/setupRootStore"
export { getRootStore } from "./helpers/getRootStore" // ✅ no conflict
