/*
   ----------------------------------------------------------------------------
   | mg_deno.so|dll                                                           |
   | Description: An abstraction of the InterSystems Cache/IRIS API           |
   |              and YottaDB API                                             |
   | Author:      Chris Munt cmunt@mgateway.com                               |
   |                         chris.e.munt@gmail.com                           |
   | Copyright (c) 2021-2022 M/Gateway Developments Ltd,                      |
   | Surrey UK.                                                               |
   | All rights reserved.                                                     |
   |                                                                          |
   | http://www.mgateway.com                                                  |
   |                                                                          |
   | Licensed under the Apache License, Version 2.0 (the "License"); you may  |
   | not use this file except in compliance with the License.                 |
   | You may obtain a copy of the License at                                  |
   |                                                                          |
   | http://www.apache.org/licenses/LICENSE-2.0                               |
   |                                                                          |
   | Unless required by applicable law or agreed to in writing, software      |
   | distributed under the License is distributed on an "AS IS" BASIS,        |
   | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. |
   | See the License for the specific language governing permissions and      |
   | limitations under the License.                                           |
   |                                                                          |
   ----------------------------------------------------------------------------
*/

#ifndef MG_DENO_H
#define MG_DENO_H

#define MAJORVERSION             1
#define MINORVERSION             0
#define MAINTVERSION             1
#define BUILDNUMBER              1

#define MGDENO_VERSION_MAJOR     "1"
#define MGDENO_VERSION_MINOR     "0"
#define MGDENO_VERSION_BUILD     "1"

#define MGDENO_VERSION           MGDENO_VERSION_MAJOR "." MGDENO_VERSION_MINOR "." MGDENO_VERSION_BUILD
#define MGDENO_COMPANYNAME       "M/Gateway Developments Ltd\0"
#define MGDENO_FILEDESCRIPTION   "API Abstraction for InterSystems IRIS/Cache and YottaDB\0"
#define MGDENO_FILEVERSION       MGDENO_VERSION
#define MGDENO_INTERNALNAME      "mg_deno\0"
#define MGDENO_LEGALCOPYRIGHT    "Copyright 2021-2022, M/Gateway Developments Ltd\0"
#define MGDENO_ORIGINALFILENAME  "mg_deno\0"
#define MGDENO_PLATFORM          PROCESSOR_ARCHITECTURE
#define MGDENO_PRODUCTNAME       "mg_deno\0"
#define MGDENO_PRODUCTVERSION    MGDENO_VERSION
#define MGDENO_BUILD             MGDENO_VERSION

#if defined(_WIN32)

#define BUILDING_NODE_EXTENSION     1
#if defined(_MSC_VER)
/* Check for MS compiler later than VC6 */
#if (_MSC_VER >= 1400)
#define _CRT_SECURE_NO_DEPRECATE    1
#define _CRT_NONSTDC_NO_DEPRECATE   1
#endif
#endif
#endif

#if defined(_WIN32)
#define MGDENO_EXTFUN(a)    __declspec(dllexport) a __cdecl
#else
#define MGDENO_EXTFUN(a)    a
#endif

#endif

