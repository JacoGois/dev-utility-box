export type CommandPlatform =
  | "bash"
  | "powershell"
  | "docker"
  | "git"
  | "npm"
  | "yarn"
  | "kubectl"
  | "other";

export interface CliCommand {
  id: string;
  name: string;
  command: string;
  description?: string;
  tags: string[];
  platform?: CommandPlatform;
  createdAt: number;
  updatedAt: number;
  isFavorite?: boolean;
}
