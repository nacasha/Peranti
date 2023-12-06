import { ToolInput } from "./ToolInput";
import { ToolOutput } from "./ToolOutput";

export interface Tool {
  /**
   * Unique ID of tool
   */
  id: string;

  /**
   * Title of tool that will be shown at header
   */
  title: string;

  /**
   * Action of tool.
   * Input always comes in form of Map as well as the returned value
   */
  action: (input: any) => any;

  /**
   * List of input fields for tool
   */
  inputs: ToolInput[];

  /**
   * List of output fields for tool
   */
  outputs: ToolOutput[];

  /**
   * Layout used to show the input and output area, default is "side-by-side"
   */
  layout?: "side-by-side" | "top-bottom" | "top-bottom-auto"

  /**
   * Layout of input and output.
   * Default layout of each type is 50% input and 50% output
   */
  // layout?: { horizontal: ["fit", ""]; vertical: ["fit"]; }

  /**
   * List of keywords to describe the utilities of tool
   */
  keywords?: string[]

  /**
   * Category of tool
   */
  category: string;
}
