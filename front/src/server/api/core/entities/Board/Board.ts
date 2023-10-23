import { type Board as BoardType } from "@prisma/client";
import { BoardSchema } from "./Validator";
import { ZodError } from "../../errors/ZodError";

type BoardPropsType =
  | (Omit<BoardType, "id" | "createdAt" | "updatedAt"> & {
      id?: string;
      createdAt: string;
      updatedAt: string;
    })
  | Record<string, never>;

export class Board {
  private _props: BoardPropsType = {};

  constructor(props: BoardPropsType) {
    const validatedProps = this.validate(props);
    if (validatedProps) this._props = validatedProps;
  }

  private validate(props: BoardPropsType) {
    console.log("______________________________________________");
    const validator = new ZodError().throw(BoardSchema.safeParse(props));
    console.log(validator);
    if (!validator) return {};
    return props;
  }

  public toJson() {
    return this._props;
  }

  private get id(): string | undefined {
    return this._props?.id;
  }
  private set id(value: string) {
    this._props.id = value;
  }

  private get name(): string | undefined {
    return this._props.name;
  }
  private set name(value: string) {
    this._props.name = value;
  }

  private get cretedAt(): string | undefined {
    return this._props.createdAt;
  }
  private set cretedAt(value: string) {
    this._props.createdAt = value;
  }

  private get updatedAt(): string | undefined {
    return this._props.updatedAt;
  }
  private set updatedAt(value: string) {
    this._props.updatedAt = value;
  }

  private get teamId(): string | undefined {
    return this._props.teamId;
  }
  private set teamId(value: string) {
    this._props.teamId = value;
  }
}
