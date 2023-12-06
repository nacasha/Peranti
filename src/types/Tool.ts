import { ToolInput } from "./ToolInput";
import { ToolOutput } from "./ToolOutput";

export interface Tool {
  id: string;
  title: string;
  action: any;
  inputs: ToolInput[];
  outputs: ToolOutput[];
}
