// @ts-ignore
import { Metadatav1 } from "./deps.ts";

// @ts-ignore
import { swaggerUi } from "./swagger_ui.ts";

// @ts-ignore
import {
  TApiDoc,
  TOpenApi,
  TOptionServe,
  TParameterObject,
  TRequestBodyObject,
  TSchemaObject,
  TTagObject
} from "./types.ts";

function joinProperty(target: any, prop: string, object: Record<string, any>) {
  const metadata = window.DeroMetadata || Metadatav1.storage;
  const className = target.constructor.name;
  metadata[className] = metadata[className] || {};
  let obj = metadata[className]["doc_paths"] || {};
  obj[prop] = obj[prop] || {};
  obj[prop]["property"] = obj[prop]["property"] || {};
  Object.assign(obj[prop]["property"], object);
  metadata[className]["doc_paths"] = obj;
}

function addSecurity(className: string, prop: string, name: string, values: any) {
  const metadata = window.DeroMetadata || Metadatav1.storage;
  let security = [
    {
      [name]: values || [],
    },
  ];
  let paths = metadata[className]["doc_paths"];
  if (paths[prop]) {
    paths[prop]["property"]["security"] =
        (paths[prop]["property"]["security"] || []).concat(security);
  }
  metadata[className]["doc_paths"] = paths;
}
export function ApiOperation(object: TApiDoc) {
  return (target: any, prop: string, des: PropertyDescriptor) => {
    const metadata = window.DeroMetadata || Metadatav1.storage;
    if (!object.responses) {
      object.responses = {};
    }
    const className = target.constructor.name;
    let info = metadata[className]["route"][prop];
    let obj = metadata[className]["doc_paths"] || {};
    obj[prop] = {
      path: info.path,
      method: info.method,
      property: object,
    };
    metadata[className]["doc_paths"] = obj;
    return des;
  };
}
export function ApiResponse(status: number, object: TRequestBodyObject) {
  if (object.schema) {
    object.content = {};
    if (typeof object.schema === "function") {
      object.content = {
        "application/json": {
          schema: {
            "$ref": "#/components/schemas/" + object.schema.name,
          },
        },
      };
    } else if (typeof object.schema === "object") {
      let obj = object.schema as Record<string, new (...args: any) => any>;
      for (const g in obj) {
        object.content[g] = {
          schema: {
            "$ref": "#/components/schemas/" + obj[g].name,
          },
        };
      }
    }
  }
  let _status = status.toString();
  return (target: any, prop: string, des: PropertyDescriptor) => {
    const metadata = window.DeroMetadata || Metadatav1.storage;
    const className = target.constructor.name;
    let obj = metadata[className]["doc_paths"] || {};
    obj[prop] = obj[prop] || {};
    obj[prop]["property"] = obj[prop]["property"] || {};
    obj[prop]["property"]["responses"][_status] = object;
    metadata[className]["doc_paths"] = obj;
    return des;
  };
}
export function ApiParameter(object: TParameterObject) {
  let parameters = [object];
  return (target: any, prop: string, des: PropertyDescriptor) => {
    const metadata = window.DeroMetadata || Metadatav1.storage;
    const className = target.constructor.name;
    let obj = metadata[className]["doc_paths"] || {};
    obj[prop] = obj[prop] || {};
    obj[prop]["property"] = obj[prop]["property"] || {};
    obj[prop]["property"]["parameters"] =
      (obj[prop]["property"]["parameters"] || []).concat(parameters);
    metadata[className]["doc_paths"] = obj;
    return des;
  };
}
export function ApiSchema(name: string, object: TSchemaObject) {
  return (target: any, prop: string, des: PropertyDescriptor) => {
    const metadata = window.DeroMetadata || Metadatav1.storage;
    metadata["doc_schemas"] = metadata["doc_schemas"] || {};
    metadata["doc_schemas"][name] = object;
    return des;
  };
}
export function ApiBearerAuth(name = "bearerAuth", values?: any) {
  return (target: any, prop: string) => {
    const className = target.constructor.name
    addSecurity(className, prop, name, values);
  };
}
export function ApiOAuth2(name = "oauth2", values?: any) {
  return (target: Function) => {
    addSecurity(target.name, name, values);
  };
}
export function ApiApiKey(name = "api_key", values?: any) {
  return (target: Function) => {
    addSecurity(target.name, name, values);
  };
}
export function ApiBasicAuth(name = "basicAuth", values?: any) {
  return (target: Function) => {
    addSecurity(target.name, name, values);
  };
}
export function ApiCookieAuth(name = "cookieAuth", values?: any) {
  return (target: Function) => {
    addSecurity(target.name, name, values);
  };
}
export function ApiRequestBody(object: TRequestBodyObject) {
  if (object.content) {
    if (object.schema) {
      delete object.schema;
    }
    return (target: any, prop: string, des: PropertyDescriptor) => {
      joinProperty(target, prop, { requestBody: object });
      return des;
    };
  }
  return (target: any, prop: string, des: PropertyDescriptor) => {
    let content = {} as any;
    if (typeof object.schema === "function") {
      content = {
        "application/json": {
          schema: {
            "$ref": "#/components/schemas/" + object.schema.name,
          },
        },
      };
    } else {
      let obj = object.schema;
      for (const k in obj) {
        content[k] = {
          schema: {
            "$ref": "#/components/schemas/" + obj[k].name,
          },
        };
      }
    }
    joinProperty(target, prop, {
      requestBody: {
        description: object.description,
        required: object.required,
        content: content,
      },
    });
    return des;
  };
}
export function ApiDocument(objOrArr: TTagObject | TTagObject[]) {
  let tags = Array.isArray(objOrArr) ? objOrArr : [objOrArr];
  return (target: Function) => {
    const metadata = window.DeroMetadata || Metadatav1.storage;
    const className = target.name;
    let route = metadata[className]["route"];
    let paths = metadata[className]["doc_paths"];
    let doc_paths = [] as any;
    let tagsName = tags.map((el: any) => el.name);
    for (const key in paths) {
      if (paths[key]) {
        paths[key]["property"]["tags"] = tagsName;
        paths[key]["path"] = route[key]["path"];
        let newPath = paths[key]["path"].split("/").map((el: string) => {
          if (el.startsWith(":")) {
            el = `{${el.substring(1)}}`;
          }
          return el;
        }).join("/");
        doc_paths.push({
          ...paths[key],
          path: newPath,
        });
      }
    }
    metadata["doc_paths"] = (metadata["doc_paths"] || []).concat(doc_paths);
    metadata["doc_tags"] = (metadata["doc_tags"] || []).concat(
      tags,
    );
  };
}

export { DocumentBuilder } from "./builder.ts";

export function swagger(
  app: any,
  docUrl: string,
  document: TOpenApi,
  opts: TOptionServe = {},
) {
  const metadata = window.DeroMetadata || Metadatav1.storage;
  const schemas = opts.validationMetadatasToSchemas
    ? opts.validationMetadatasToSchemas()
    : {};
  const doc_paths = metadata["doc_paths"];
  const schemasOri = metadata["doc_schemas"] || {};
  let j = 0;
  let paths = {} as any;
  let aLen = doc_paths.length;
  for (; j < aLen; j++) {
    const doc = doc_paths[j];
    paths[doc.path] = paths[doc.path] || {};
    paths[doc.path][doc.method.toLowerCase()] = doc.property;
  }
  document.paths = paths;
  document.tags = metadata["doc_tags"];
  document.components["schemas"] = {
    ...schemasOri,
    ...schemas,
  };
  app.get(docUrl + "/swagger-ui-init.js", swaggerUi.serveInitAssets());
  app.get(docUrl, swaggerUi.setup(document, opts));
  app.get(docUrl + "/json", (req: any, res: any) => {
    res.body(document);
  });
}
