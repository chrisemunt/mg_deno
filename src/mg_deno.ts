//
//   ----------------------------------------------------------------------------
//   | Package:     mg_deno                                                     |
//   | OS:          Unix/Windows                                                |
//   | Description: An Interface to InterSystems Cache/IRIS and YottaDB         |
//   | Author:      Chris Munt cmunt@mgateway.com                               |
//   |                         chris.e.munt@gmail.com                           |
//   | Copyright (c) 2021-2022 M/Gateway Developments Ltd,                      |
//   | Surrey UK.                                                               |
//   | All rights reserved.                                                     |
//   |                                                                          |
//   | http://www.mgateway.com                                                  |
//   |                                                                          |
//   | Licensed under the Apache License, Version 2.0 (the "License"); you may  |
//   | not use this file except in compliance with the License.                 |
//   | You may obtain a copy of the License at                                  |
//   |                                                                          |
//   | http://www.apache.org/licenses/LICENSE-2.0                               |
//   |                                                                          |
//   | Unless required by applicable law or agreed to in writing, software      |
//   | distributed under the License is distributed on an "AS IS" BASIS,        |
//   | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
//   | See the License for the specific language governing permissions and      |
//   | limitations under the License.                                           |      
//   |                                                                          |
//   ----------------------------------------------------------------------------
//

const DBX_VERSION_MAJOR: number     = 1;
const DBX_VERSION_MINOR: number     = 1;
const DBX_VERSION_BUILD: number     = 2;

const DBX_DSORT_INVALID: number     = 0;
const DBX_DSORT_DATA: number        = 1;
const DBX_DSORT_SUBSCRIPT: number   = 2;
const DBX_DSORT_GLOBAL: number      = 3;
const DBX_DSORT_EOD: number         = 9;
const DBX_DSORT_STATUS: number      = 10;
const DBX_DSORT_ERROR: number       = 11;

const DBX_DTYPE_NONE: number        = 0;
const DBX_DTYPE_STR: number         = 1;
const DBX_DTYPE_STR8: number        = 2;
const DBX_DTYPE_STR16: number       = 3;
const DBX_DTYPE_INT: number         = 4;
const DBX_DTYPE_INT64: number       = 5;
const DBX_DTYPE_DOUBLE: number      = 6;
const DBX_DTYPE_OREF: number        = 7;
const DBX_DTYPE_NULL: number        = 10;

const DBX_CMND_OPEN: number         = 1;
const DBX_CMND_CLOSE: number        = 2;
const DBX_CMND_NSGET: number        = 3;
const DBX_CMND_NSSET: number        = 4;

const DBX_CMND_GSET: number         = 11;
const DBX_CMND_GGET: number         = 12;
const DBX_CMND_GNEXT: number        = 13;
const DBX_CMND_GPREVIOUS: number    = 14;
const DBX_CMND_GDELETE: number      = 15;
const DBX_CMND_GDEFINED: number     = 16;
const DBX_CMND_GINCREMENT: number   = 17;
const DBX_CMND_GLOCK: number        = 18;
const DBX_CMND_GUNLOCK: number      = 19
const DBX_CMND_GMERGE: number       = 20

const DBX_CMND_FUNCTION: number     = 31;

const DBX_CMND_CCMETH: number       = 41;
const DBX_CMND_CGETP: number        = 42;
const DBX_CMND_CSETP: number        = 43;
const DBX_CMND_CMETH: number        = 44;
const DBX_CMND_CCLOSE: number       = 45;

const DBX_CMND_TSTART: number       = 61;
const DBX_CMND_TLEVEL: number       = 62;
const DBX_CMND_TCOMMIT: number      = 63;
const DBX_CMND_TROLLBACK: number    = 64;

const DBX_INPUT_BUFFER_SIZE: number = 32768;

let lib_ext = "";
switch (Deno.build.os) {
   case "windows":
      lib_ext = "dll";
      break;
   default:
      lib_ext = "so";
      break;
}
const lib_name = './mg_deno.' + lib_ext;
const dylib = Deno.dlopen(lib_name, {
               "mgdeno_init": { parameters: [], result: "void" },
               "mgdeno_version": { parameters: [], result: "pointer" },
               "mgdeno_dbversion": { parameters: [], result: "pointer" },
               "mgdeno_command": { parameters: ["pointer", "isize", "isize", "isize"], result: "pointer" },
               "mgdeno_benchmark": { parameters: ["pointer", "isize", "isize", "isize"], result: "pointer" },
               });

export class mresult {

}

export class server {
   type: string = "";
   path: string = "";
   host: string = "";
   tcp_port: number = 0;
   username: string = "";
   password: string = "";
   namespace: string = "";
   env_vars: string = "";
   debug: string = "";
   server: string = "";
   server_software: string = "";
   timeout: number = 60;
   init: number = 0;
   index: number = 0;

   version(): string {
      const ret = dylib.symbols.mgdeno_version();
      const data_view = new Deno.UnsafePointerView(ret);
      return data_view.getCString();
   }

   dbversion(): string {
      if (this.init === 0) {
         const ret = dylib.symbols.mgdeno_init();
         this.init++;
      }
      const ret = dylib.symbols.mgdeno_dbversion();
      const data_view = new Deno.UnsafePointerView(ret);
      return data_view.getCString();
   }

   open(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         const ret = dylib.symbols.mgdeno_init();
         this.init ++;
      }

      offset = block_add_size(buffer, offset, offset, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, buffer.length, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, this.index, DBX_DSORT_DATA, DBX_DTYPE_INT);

      offset = block_add_string(buffer, offset, this.type, this.type.length, DBX_DSORT_DATA, DBX_DTYPE_STR);
      offset = block_add_string(buffer, offset, this.path, this.path.length, DBX_DSORT_DATA, DBX_DTYPE_STR);
      offset = block_add_string(buffer, offset, this.host, this.host.length, DBX_DSORT_DATA, DBX_DTYPE_STR);
      offset = block_add_string(buffer, offset, this.tcp_port.toString(), this.tcp_port.toString().length, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_string(buffer, offset, this.username, this.username.length, DBX_DSORT_DATA, DBX_DTYPE_STR);
      offset = block_add_string(buffer, offset, this.password, this.password.length, DBX_DSORT_DATA, DBX_DTYPE_STR);
      offset = block_add_string(buffer, offset, this.namespace, this.namespace.length, DBX_DSORT_DATA, DBX_DTYPE_STR);
      offset = block_add_string(buffer, offset, "", 0, DBX_DSORT_DATA, DBX_DTYPE_STR);
      offset = block_add_string(buffer, offset, "", 0, DBX_DSORT_DATA, DBX_DTYPE_STR);
      offset = block_add_string(buffer, offset, this.debug, this.debug.length, DBX_DSORT_DATA, DBX_DTYPE_STR);
      offset = block_add_string(buffer, offset, this.env_vars, this.env_vars.length, DBX_DSORT_DATA, DBX_DTYPE_STR);
      offset = block_add_string(buffer, offset, this.server, this.server.length, DBX_DSORT_DATA, DBX_DTYPE_STR);
      offset = block_add_string(buffer, offset, this.server_software, this.server_software.length, DBX_DSORT_DATA, DBX_DTYPE_STR);
      offset = block_add_string(buffer, offset, this.timeout.toString(), this.timeout.toString().length, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_string(buffer, offset, "", 0, DBX_DSORT_EOD, DBX_DTYPE_STR);
      add_head(buffer, 0, offset, DBX_CMND_OPEN);

      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_OPEN, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }


   close(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = block_add_size(buffer, offset, offset, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, buffer.length, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, this.index, DBX_DSORT_DATA, DBX_DTYPE_INT);

      offset = block_add_string(buffer, offset, "", 0, DBX_DSORT_EOD, DBX_DTYPE_STR);
      add_head(buffer, 0, offset, DBX_CMND_CLOSE);

      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_CLOSE, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }


   current_namespace(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = block_add_size(buffer, offset, offset, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, buffer.length, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, this.index, DBX_DSORT_DATA, DBX_DTYPE_INT);

      if (args.length > 0) {
         offset = pack_arguments(buffer, offset, this.index, args, DBX_CMND_NSSET, 0);
         const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_NSSET, 0);
         const data_view = new Deno.UnsafePointerView(ret);
      }

      offset = 0;
      offset = block_add_size(buffer, offset, offset, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, buffer.length, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, this.index, DBX_DSORT_DATA, DBX_DTYPE_INT);

      offset = block_add_string(buffer, offset, "", 0, DBX_DSORT_EOD, DBX_DTYPE_STR);
      add_head(buffer, 0, offset, DBX_CMND_NSGET);

      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_NSGET, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   set(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = pack_arguments(buffer, offset, this.index, args, DBX_CMND_GSET, 0);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GSET, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   get(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = pack_arguments(buffer, offset, this.index, args, DBX_CMND_GGET, 0);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GGET, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   delete(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = pack_arguments(buffer, offset, this.index, args, DBX_CMND_GDELETE, 0);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GDELETE, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   defined(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = pack_arguments(buffer, offset, this.index, args, DBX_CMND_GDEFINED, 0);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GDEFINED, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   next(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = pack_arguments(buffer, offset, this.index, args, DBX_CMND_GNEXT, 0);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GNEXT, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;

   }

   previous(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = pack_arguments(buffer, offset, this.index, args, DBX_CMND_GPREVIOUS, 0);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GPREVIOUS, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   increment(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = pack_arguments(buffer, offset, this.index, args, DBX_CMND_GINCREMENT, 0);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GINCREMENT, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   lock(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = pack_arguments(buffer, offset, this.index, args, DBX_CMND_GLOCK, 0);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GLOCK, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   unlock(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = pack_arguments(buffer, offset, this.index, args, DBX_CMND_GUNLOCK, 0);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GUNLOCK, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   tstart(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = block_add_size(buffer, offset, offset, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, buffer.length, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, this.index, DBX_DSORT_DATA, DBX_DTYPE_INT);

      offset = block_add_string(buffer, offset, "", 0, DBX_DSORT_EOD, DBX_DTYPE_STR);
      add_head(buffer, 0, offset, DBX_CMND_TSTART);

      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_TSTART, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   tlevel(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = block_add_size(buffer, offset, offset, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, buffer.length, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, this.index, DBX_DSORT_DATA, DBX_DTYPE_INT);

      offset = block_add_string(buffer, offset, "", 0, DBX_DSORT_EOD, DBX_DTYPE_STR);
      add_head(buffer, 0, offset, DBX_CMND_TLEVEL);

      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_TLEVEL, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   tcommit(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = block_add_size(buffer, offset, offset, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, buffer.length, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, this.index, DBX_DSORT_DATA, DBX_DTYPE_INT);

      offset = block_add_string(buffer, offset, "", 0, DBX_DSORT_EOD, DBX_DTYPE_STR);
      add_head(buffer, 0, offset, DBX_CMND_TCOMMIT);

      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_TCOMMIT, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   trollback(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = block_add_size(buffer, offset, offset, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, buffer.length, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, this.index, DBX_DSORT_DATA, DBX_DTYPE_INT);

      offset = block_add_string(buffer, offset, "", 0, DBX_DSORT_EOD, DBX_DTYPE_STR);
      add_head(buffer, 0, offset, DBX_CMND_TROLLBACK);

      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_TROLLBACK, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   function(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = pack_arguments(buffer, offset, this.index, args, DBX_CMND_FUNCTION, 0);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_FUNCTION, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   classmethod(...args: any[]): any {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.init === 0) {
         return "";
      }

      offset = pack_arguments(buffer, offset, this.index, args, DBX_CMND_CCMETH, 0);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_CCMETH, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      if (result.type === DBX_DTYPE_OREF) {
         const cls = new mclass(this);
         cls.class_name = args[0];
         cls.oref = result.data;
         return cls;
      }

      return result.data;
   }

   benchmark(...args: any[]): string {
      let i = 0;
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);
      let istring = "input string";

      for (i = 0; i < istring.length; i ++) {
         buffer[i] = istring.charCodeAt(i);
      }
      buffer[i] = 0;

      const ret = dylib.symbols.mgdeno_benchmark(buffer, i, 0, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      return data_view.getCString();
   }
}

export class mglobal {
   db: server;
   global_name: string = "";
   base_buffer: Uint8Array;
   base_offset: number = 0;

   constructor(db: server, ...args: any[]) {
      this.db = db;
      this.base_buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);
      this.base_offset = 0;
      this.base_offset = pack_arguments(this.base_buffer, this.base_offset, this.db.index, args, 0, 0);
      this.base_offset -= 5;
      if (args.length > 0) {
         this.global_name = args[0];
      }
      return;
   }

   set(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.db.init === 0) {
         return "";
      }

      offset = block_copy(buffer, offset, this.base_buffer, 0, this.base_offset);
      offset = pack_arguments(buffer, offset, this.db.index, args, DBX_CMND_GSET, 1);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GSET, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   get(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.db.init === 0) {
         return "";
      }

      offset = block_copy(buffer, offset, this.base_buffer, 0, this.base_offset);
      offset = pack_arguments(buffer, offset, this.db.index, args, DBX_CMND_GGET, 1);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GGET, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   delete(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.db.init === 0) {
         return "";
      }

      offset = block_copy(buffer, offset, this.base_buffer, 0, this.base_offset);
      offset = pack_arguments(buffer, offset, this.db.index, args, DBX_CMND_GDELETE, 1);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GDELETE, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   defined(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.db.init === 0) {
         return "";
      }

      offset = block_copy(buffer, offset, this.base_buffer, 0, this.base_offset);
      offset = pack_arguments(buffer, offset, this.db.index, args, DBX_CMND_GDEFINED, 1);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GDEFINED, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   next(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.db.init === 0) {
         return "";
      }

      offset = block_copy(buffer, offset, this.base_buffer, 0, this.base_offset);
      offset = pack_arguments(buffer, offset, this.db.index, args, DBX_CMND_GNEXT, 1);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GNEXT, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   previous(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.db.init === 0) {
         return "";
      }

      offset = block_copy(buffer, offset, this.base_buffer, 0, this.base_offset);
      offset = pack_arguments(buffer, offset, this.db.index, args, DBX_CMND_GPREVIOUS, 1);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GPREVIOUS, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   increment(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.db.init === 0) {
         return "";
      }

      offset = block_copy(buffer, offset, this.base_buffer, 0, this.base_offset);
      offset = pack_arguments(buffer, offset, this.db.index, args, DBX_CMND_GINCREMENT, 1);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GINCREMENT, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   lock(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.db.init === 0) {
         return "";
      }

      offset = block_copy(buffer, offset, this.base_buffer, 0, this.base_offset);
      offset = pack_arguments(buffer, offset, this.db.index, args, DBX_CMND_GLOCK, 1);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GLOCK, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   unlock(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.db.init === 0) {
         return "";
      }

      offset = block_copy(buffer, offset, this.base_buffer, 0, this.base_offset);
      offset = pack_arguments(buffer, offset, this.db.index, args, DBX_CMND_GUNLOCK, 1);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GUNLOCK, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   merge(...args: any[]): string {
      let offset = 0;
      let sort = 0;
      let str = "";
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.db.init === 0) {
         return "";
      }

      offset = block_copy(buffer, offset, this.base_buffer, 0, this.base_offset);

      for (let argn = 0; argn < args.length; argn ++) {
         if (typeof args[argn] === "object" && args[argn].constructor.name == "mglobal") {
            offset = block_copy(buffer, offset, args[argn].base_buffer, 15, args[argn].base_offset);
         }
         else if (typeof args[argn] === "string") {
            str = args[argn];
            offset = block_add_string(buffer, offset, str, str.length, DBX_DSORT_DATA, DBX_DTYPE_STR);
         }
         else {
            str = args[argn].toString();
            offset = block_add_string(buffer, offset, str, str.length, DBX_DSORT_DATA, DBX_DTYPE_STR);
         }
      }

      offset = block_add_string(buffer, offset, "", 0, DBX_DSORT_EOD, DBX_DTYPE_STR)
      add_head(buffer, 0, offset, DBX_CMND_GMERGE);

      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_GMERGE, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   reset(...args: any[]) {
      this.base_offset = 0;
      this.base_offset = pack_arguments(this.base_buffer, this.base_offset, this.db.index, args, 0, 0);
      this.base_offset -= 5;
      if (args.length > 0) {
         this.global_name = args[0];
      }
      return;
   }

}

export class mclass {
   db: server;
   class_name: string = "";
   oref: string = "";
   base_buffer: Uint8Array;
   base_offset: number = 0;

   constructor(db: server, ...args: any[]) {
      this.db = db;
      this.base_buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);
      this.base_offset = 0;

      this.base_offset = block_add_size(this.base_buffer, this.base_offset, this.base_offset, DBX_DSORT_DATA, DBX_DTYPE_INT);
      this.base_offset = block_add_size(this.base_buffer, this.base_offset, this.base_buffer.length, DBX_DSORT_DATA, DBX_DTYPE_INT);
      this.base_offset = block_add_size(this.base_buffer, this.base_offset, db.index, DBX_DSORT_DATA, DBX_DTYPE_INT);

      if (args.length > 0) {
         this.class_name = args[0];
         this.base_offset = block_add_string(this.base_buffer, this.base_offset, this.class_name, this.class_name.length, DBX_DSORT_DATA, DBX_DTYPE_STR);
         if (args.length > 1 && this.db.init > 0) {
            let offset = 0;
            let result = { data: "", error_message: "", type: 0 };
            const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

            offset = pack_arguments(buffer, offset, db.index, args, DBX_CMND_CCMETH, 0);
            const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_CCMETH, 0);
            const data_view = new Deno.UnsafePointerView(ret);
            get_result(data_view, result);
            if (result.type === DBX_DTYPE_OREF) {
               this.oref = result.data;
            }
         }
      }
      return;
   }

   classmethod(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.db.init === 0) {
         return "";
      }

      offset = block_copy(buffer, offset, this.base_buffer, 0, this.base_offset);
      offset = pack_arguments(buffer, offset, this.db.index, args, DBX_CMND_CCMETH, 1);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_CCMETH, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      if (result.type === DBX_DTYPE_OREF) {
         this.oref = result.data;
      }
      return result.data;
   }

   method(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.db.init === 0) {
         return "";
      }

      offset = block_copy(buffer, offset, this.base_buffer, 0, 15);
      offset = block_add_string(buffer, offset, this.oref, this.oref.length, DBX_DSORT_DATA, DBX_DTYPE_OREF);
      offset = pack_arguments(buffer, offset, this.db.index, args, DBX_CMND_CMETH, 1);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_CMETH, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   getproperty(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.db.init === 0) {
         return "";
      }

      offset = block_copy(buffer, offset, this.base_buffer, 0, 15);
      offset = block_add_string(buffer, offset, this.oref, this.oref.length, DBX_DSORT_DATA, DBX_DTYPE_OREF);
      offset = pack_arguments(buffer, offset, this.db.index, args, DBX_CMND_CGETP, 1);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_CGETP, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   setproperty(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.db.init === 0) {
         return "";
      }

      offset = block_copy(buffer, offset, this.base_buffer, 0, 15);
      offset = block_add_string(buffer, offset, this.oref, this.oref.length, DBX_DSORT_DATA, DBX_DTYPE_OREF);
      offset = pack_arguments(buffer, offset, this.db.index, args, DBX_CMND_CSETP, 1);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_CSETP, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   closeinstance(...args: any[]): string {
      let offset = 0;
      let result = { data: "", error_message: "", type: 0 };
      const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

      if (this.db.init === 0) {
         return "";
      }

      offset = block_copy(buffer, offset, this.base_buffer, 0, 15);
      offset = block_add_string(buffer, offset, this.oref, this.oref.length, DBX_DSORT_DATA, DBX_DTYPE_OREF);
      offset = pack_arguments(buffer, offset, this.db.index, args, DBX_CMND_CCLOSE, 1);
      const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_CCLOSE, 0);
      const data_view = new Deno.UnsafePointerView(ret);
      get_result(data_view, result);
      return result.data;
   }

   reset(...args: any[]) {
      this.base_offset = 0;

      this.base_offset = block_add_size(this.base_buffer, this.base_offset, this.base_offset, DBX_DSORT_DATA, DBX_DTYPE_INT);
      this.base_offset = block_add_size(this.base_buffer, this.base_offset, this.base_buffer.length, DBX_DSORT_DATA, DBX_DTYPE_INT);
      this.base_offset = block_add_size(this.base_buffer, this.base_offset, this.db.index, DBX_DSORT_DATA, DBX_DTYPE_INT);

      if (args.length > 0) {
         this.class_name = args[0];
         this.base_offset = block_add_string(this.base_buffer, this.base_offset, this.class_name, this.class_name.length, DBX_DSORT_DATA, DBX_DTYPE_STR);
         if (args.length > 1 && this.db.init > 0) {
            let offset = 0;
            let result = { data: "", error_message: "", type: 0 };
            const buffer = new Uint8Array(DBX_INPUT_BUFFER_SIZE);

            offset = pack_arguments(buffer, offset, this.db.index, args, DBX_CMND_CCMETH, 0);
            const ret = dylib.symbols.mgdeno_command(buffer, offset, DBX_CMND_CCMETH, 0);
            const data_view = new Deno.UnsafePointerView(ret);
            get_result(data_view, result);
            if (result.type === DBX_DTYPE_OREF) {
               this.oref = result.data;
            }
         }
      }
      return;
   }
}

function pack_arguments(buffer: Uint8Array, offset: number, index: number, args: any[], command: number, context: number): number {
   let str = "";

   if (context === 0) {
      offset = block_add_size(buffer, offset, offset, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, buffer.length, DBX_DSORT_DATA, DBX_DTYPE_INT);
      offset = block_add_size(buffer, offset, index, DBX_DSORT_DATA, DBX_DTYPE_INT);
   }

   for (let argn = 0; argn < args.length; argn ++) {
      //console.log(argn, " = ", args[argn], " : ", typeof args[argn]);
      if (typeof args[argn] === "string")
         str = args[argn];
      else
         str = args[argn].toString();
      if (argn == 0)
         offset = block_add_string(buffer, offset, str, str.length, DBX_DSORT_GLOBAL, DBX_DTYPE_STR);
      else
         offset = block_add_string(buffer, offset, str, str.length, DBX_DSORT_DATA, DBX_DTYPE_STR);
   }

   offset = block_add_string(buffer, offset, "", 0, DBX_DSORT_EOD, DBX_DTYPE_STR)
   add_head(buffer, 0, offset, command);

   return offset;
}

function get_result(data_view: Deno.UnsafePointerView, result: {data: string, error_message: string, type: number }): string {
   let data_properties = { len: 0, type: 0, sort: 0 };
   const buffer = data_view.getArrayBuffer(5, 0);

   block_get_size(new Uint8Array(buffer), 0, data_properties);

   //console.log("mg_deno data_view data properties => ", data_properties);

   if (data_properties.sort === DBX_DSORT_ERROR) {
      result.error_message = data_view.getCString(5);
   }
   else {
      result.data = data_view.getCString(5);
   }
   result.type = data_properties.type;
   return result.data;
}

function block_copy(buffer_to: Uint8Array, offset: number, buffer_from: Uint8Array, from: number, to: number): number {
   for (let i = from; i < to; i ++) {
      buffer_to[offset ++] = buffer_from[i];
   }
   return offset;
}

function block_add_string(buffer: Uint8Array, offset: number, data:string, data_len: number, data_sort: number, data_type: number): number {
   offset = block_add_size(buffer, offset, data_len, data_sort, data_type);
   for (let i = 0; i < data_len; i ++) {
      buffer[offset ++] = data.charCodeAt(i);
   }
   return offset;
}

function block_add_size(buffer: Uint8Array, offset: number, data_len: number, data_sort: number, data_type: number): number {
   buffer[offset + 0] = (data_len >> 0);
   buffer[offset + 1] = (data_len >> 8);
   buffer[offset + 2] = (data_len >> 16);
   buffer[offset + 3] = (data_len >> 24);
   buffer[offset + 4] = ((data_sort * 20) + data_type);
   return (offset + 5);
}

function add_head(buffer: Uint8Array, offset: number, data_len: number, cmnd: number): number {
   buffer[offset + 0] = (data_len >> 0);
   buffer[offset + 1] = (data_len >> 8);
   buffer[offset + 2] = (data_len >> 16);
   buffer[offset + 3] = (data_len >> 24);
   buffer[offset + 4] = cmnd;
   return (offset + 5);
}

function block_get_size(buffer: Uint8Array, offset: number, data_properties: {len: number; type: number; sort: number}) {
   data_properties.len = ((buffer[offset + 0]) | (buffer[offset + 1] << 8) | (buffer[offset + 2] << 16) | (buffer[offset + 3] << 24));
   data_properties.sort = buffer[4];
   data_properties.type = data_properties.sort % 20;
   data_properties.sort = Math.floor(data_properties.sort / 20);
   return data_properties;
}

