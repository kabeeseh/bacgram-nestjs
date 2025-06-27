import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  Post,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';

@Controller('api/posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}
  @Get('')
  getPosts(@Headers() headers: any) {
    return this.postsService.get(headers.authorization.split(' ')[1]);
  }
  @Post('')
  createPost(
    @Headers() headers: any,
    @Body() body: { title: string; content: string },
  ) {
    return this.postsService.createPost(
      headers.authorization.split(' ')[1],
      body.title,
      body.content,
    );
  }
  @Get('user')
  getUserPosts(@Headers() headers: any, @Query('page') page: number = 1) {
    return this.postsService.userPosts(
      headers.authorization.split(' ')[1],
      page,
    );
  }
}
