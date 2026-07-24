import { Script } from "vm";
import { ScriptId } from "../../../domain/scripts/model/script-id";

export interface ScriptRepository {
  findById(
    scriptId: ScriptId,
  ): Promise<Script | undefined>;

  findAll(): Promise<
    readonly Script[]
  >;
}