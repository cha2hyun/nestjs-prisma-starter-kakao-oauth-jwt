import { ObjectType } from "@nestjs/graphql";

import { Post } from "./post.model";
import PaginatedResponse from "../../common/pagination/pagination";

@ObjectType()
export class PostConnection extends PaginatedResponse(Post) {}
