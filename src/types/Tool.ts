import { ToolInput } from "./ToolInput";
import { ToolOutput } from "./ToolOutput";

export interface Tool {
  title: string;
  action: any;
  inputs: ToolInput[];
  outputs: ToolOutput[];
}
