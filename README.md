## Dero Swagger
[![License](https://img.shields.io/:license-mit-blue.svg)](http://badges.mit-license.org)

Swagger doc for [Dero](https://github.com/herudi/dero) framework based on OAS3.
Inspire [nestjs-swagger](https://github.com/nestjs/swagger) and
[swagger-ui-express](https://github.com/scottie1984/swagger-ui-express).

See Demo => https://dero-swagger.deno.dev/api-docs

> Requires Dero version 1.2.1 or higher

## Installation

### deno.land

```ts
import {...} from "https://deno.land/x/dero_swagger@0.0.6/mod.ts";
```

## Usage

```ts
import {
  BaseController,
  Controller,
  Dero,
  Get,
  Metadata,
} from "https://deno.land/x/dero@1.2.1/mod.ts";

import {
  ApiDocument,
  ApiOperation,
  ApiResponse,
  DocumentBuilder,
  swagger,
} from "https://deno.land/x/dero_swagger@0.0.6/mod.ts";

@ApiDocument({
  name: "Doc user 1.0",
  description: "doc user description",
})
@Controller("/user")
class UserController extends BaseController {
  @ApiResponse(200, { description: "OK" })
  @ApiOperation({ summary: "get user" })
  @Get()
  getUser() {
    return "Hello";
  }
}

class Application extends Dero {
  constructor() {
    super();
    this.use({ class: [UserController] });

    // document builder
    const document = new DocumentBuilder()
      .setInfo({
        title: "Rest APIs for amazing app",
        version: "1.0.0",
        description: "This is the amazing app",
      })
      .addServer("http://localhost:3000")
      .build();

    // serve swagger
    swagger(this, "/api-docs", document);
  }
}

await new Application().listen(3000, () => {
  console.log("Running on port 3000");
});

// serving on http://localhost:3000/api-docs
// lookup json http://localhost:3000/api-docs/json
```

## Run

```bash
deno run --allow-net --unstable yourfile.ts
```

or

```bash
deno run --allow-net yourfile.ts
```

## Bearer Auth (JWT)

```ts
...
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiDocument,
    DocumentBuilder,
    swagger
} from "https://deno.land/x/dero_swagger@0.0.6/mod.ts";

@ApiBearerAuth()
@ApiDocument({
    name: "Doc user 1.0",
    description: "doc user description"
})
@Controller("/user")
class UserController extends BaseController {

    @ApiResponse(200, { description: "OK" })
    @ApiOperation({ summary: "get user" })
    @Get()
    getUser() {
        return "Hello";
    }
}

...

// builder
const document = new DocumentBuilder()
    .setInfo({
        title: "Rest APIs for amazing app",
        version: "1.0.0",
        description: "This is the amazing app",
    })
    .addServer("http://localhost:3000")
    // add this
    .addBearerAuth()
    .build()
```

## Params

```ts
...
import {
    ApiOperation,
    ApiResponse,
    ApiParameter,
    ApiDocument,
    DocumentBuilder,
    swagger
} from "https://deno.land/x/dero_swagger@0.0.6/mod.ts";

@ApiDocument({
    name: "Doc user 1.0",
    description: "doc user description"
})
@Controller("/user")
class UserController extends BaseController {

    @ApiParameter({
        name: "id",
        in: "path"
    })
    @ApiParameter({
        name: "name",
        in: "query"
    })
    @ApiResponse(200, { description: "OK" })
    @ApiOperation({ summary: "get user id" })
    @Get("/:id")
    getUserId() {
        return "Hello";
    }
}
...
```

## Request Body (Manual)

```ts
...
import {
    ApiOperation,
    ApiResponse,
    ApiRequestBody,
    ApiDocument,
    DocumentBuilder,
    swagger
} from "https://deno.land/x/dero_swagger@0.0.6/mod.ts";

@ApiDocument({
    name: "Doc user 1.0",
    description: "doc user description"
})
@Controller("/user")
class UserController extends BaseController {

    @ApiRequestBody({
        description: "Save User",
        required: true,
        content: {
            "application/json": {
                schema: {
                    type: "object",
                    properties: {
                        name: {
                            type: "string"
                        },
                        id: {
                            type: "integer"
                        }
                    }
                }
            }
        }
    })
    @ApiResponse(201, { description: "Created" })
    @ApiOperation({ summary: "save user" })
    @Post()
    save() {
        return "Success";
    }
}
...
```

## Request Body (auto generate)

```ts
...
import {
    ApiOperation,
    ApiResponse,
    ApiRequestBody,
    ApiDocument,
    DocumentBuilder,
    swagger
} from "https://deno.land/x/dero_swagger@0.0.6/mod.ts";

// import class validator
import {
  IsNumber,
  IsString
} from "https://cdn.skypack.dev/class-validator?dts";

// import class-validator-jsonschema
import { validationMetadatasToSchemas } from "https://cdn.skypack.dev/class-validator-jsonschema?dts";

class UserCreateDto {
  @IsString()
  name!: string;

  @IsNumber()
  id!: number;
}

@ApiDocument({
    name: "Doc user 1.0",
    description: "doc user description"
})
@Controller("/user")
class UserController extends BaseController {

    @ApiRequestBody({
        description: "Save User",
        required: true,
        schema: UserCreateDto
    })
    @ApiResponse(201, { description: "Created" })
    @ApiOperation({ summary: "save user" })
    @Post()
    save() {
        return "Success";
    }
}
...

// add to options
swagger(this, "/api-docs", document, { validationMetadatasToSchemas });
```

## License

[MIT](LICENSE)
