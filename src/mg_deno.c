/*
   ----------------------------------------------------------------------------
   | mg_deno.so|dll                                                           |
   | Description: An abstraction of the InterSystems Cache/IRIS API           |
   |              and YottaDB API                                             |
   | Author:      Chris Munt cmunt@mgateway.com                               |
   |                         chris.e.munt@gmail.com                           |
   | Copyright (c) 2019-2023 MGateway Ltd                                     |
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

/*
   Development Diary (in brief):

Version 1.0.1 27 May 2022:
   First release.

Version 1.1.2 15 June 2022:
   Introduce the mglobal and mclass classes - designed to be compatible with the equivalent classes in mg-dbx.

Version 1.1.3 20 July 2022:
   Performance improvements.

Version 1.1.3a 23 June 2023:
   Documentation update.

*/

#include "mg_deno.h"
#include "mg_dba.h"

#include <stdio.h>
#include <string.h>
#ifdef _WIN32
#include <Windows.h>
#else
#include <stdlib.h>
#include <time.h>
#endif

char gbuffer[CACHE_MAXLOSTSZ + 7];

#if defined(_WIN32)
BOOL WINAPI DllMain(HINSTANCE hinstDLL, DWORD fdwReason, LPVOID lpReserved)
{
   switch (fdwReason)
   { 
      case DLL_PROCESS_ATTACH:
         mg_init_critical_section((void *) &dbx_global_mutex);
         break;
      case DLL_THREAD_ATTACH:
         break;
      case DLL_THREAD_DETACH:
         break;
      case DLL_PROCESS_DETACH:
         mg_delete_critical_section((void *) &dbx_global_mutex);
         break;
   }
   return TRUE;
}
#endif /* #if defined(_WIN32) */


MGDENO_EXTFUN(void) mgdeno_init(void)
{
   dbx_init();
}


MGDENO_EXTFUN(char *) mgdeno_version(void)
{
   sprintf(gbuffer, "%s", MGDENO_VERSION);
   return gbuffer;
}


MGDENO_EXTFUN(char *) mgdeno_dbversion(void)
{
   int index;

   index = 0;
   dbx_version(index, gbuffer, 256);
   return gbuffer;
}


MGDENO_EXTFUN(char *) mgdeno_command(unsigned char *input, int input_len, int command, int context)
{
   int dsort, dtype;
   unsigned long len;
   char *output;
   DBXSTR block;

   output = (unsigned char *) gbuffer;

   switch (command) {
      case DBX_CMND_OPEN:
         dbx_open(input, output);
         break;
      case DBX_CMND_CLOSE:
         dbx_close(input, output);
         break;
      case DBX_CMND_GSET:
         dbx_set(input, output);
         break;
      case DBX_CMND_GGET:
         dbx_get(input, output);
         break;
      case DBX_CMND_GDELETE:
         dbx_delete(input, output);
         break;
      case DBX_CMND_GDEFINED:
         dbx_defined(input, output);
         break;
      case DBX_CMND_GNEXT:
         dbx_next(input, output);
         break;
      case DBX_CMND_GPREVIOUS:
         dbx_previous(input, output);
         break;
      case DBX_CMND_GINCREMENT:
         dbx_increment(input, output);
         break;
      case DBX_CMND_GMERGE:
         dbx_merge(input, output);
         break;
      case DBX_CMND_GLOCK:
         dbx_lock(input, output);
         break;
      case DBX_CMND_GUNLOCK:
         dbx_unlock(input, output);
         break;
      case DBX_CMND_TSTART:
         dbx_tstart(input, output);
         break;
      case DBX_CMND_TLEVEL:
         dbx_tlevel(input, output);
         break;
      case DBX_CMND_TCOMMIT:
         dbx_tcommit(input, output);
         break;
      case DBX_CMND_TROLLBACK:
         dbx_trollback(input, output);
         break;
      case DBX_CMND_FUNCTION:
         dbx_function(input, output);
         break;
      case DBX_CMND_CCMETH:
         dbx_classmethod(input, output);
         break;
      case DBX_CMND_CGETP:
         dbx_getproperty(input, output);
         break;
      case DBX_CMND_CSETP:
         dbx_setproperty(input, output);
         break;
      case DBX_CMND_CMETH:
         dbx_method(input, output);
         break;
      case DBX_CMND_CCLOSE:
         dbx_closeinstance(input, output);
         break;
      default:
         memset(output, 0, 10);
         break;
   }

   block.buf_addr = output;
   block.len_alloc = 0;
   block.len_used = 0;
   len = mg_get_block_size(&block, 0, &dsort, &dtype);

   if (dsort == DBX_DSORT_ERROR) {
      output[len + 5] = '\0';
   }
   else {
      output[len + 5] = '\0';
   }

   return output;
}


MGDENO_EXTFUN(char *) mgdeno_benchmark(unsigned char *input, int input_len, int command, int context)
{
   char *output;

   output = (unsigned char *) gbuffer;
/*
   printf("\r\n input_len=%d; command=%d; context=%d; %s", input_len, command, context, input);
*/

   strcpy(output, "output string");
   return output;
}

