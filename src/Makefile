# UNIX makefile for mg_deno module (mg_deno.so)
#
# Build:
# make Makefile
#
# Cleanup:
# make clean
#
# Install:
# make install

MGDENODIR=/usr/local/lib/mg_deno
MGDENOINC=./

UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
   MGDENOOS = Linux
   CC = cc
   CCFLAGS += -fpic -DLINUX
   LINK += cc
   LINKFLAGS += -shared -rdynamic
endif
ifeq ($(UNAME_S),Darwin)
   MGDENOOS = OSX
   CC = cc
   CCFLAGS += -fPIC -fno-common -DMACOSX -D_NOTHREADS -DDARWIN
   LINK += cc
   LINKFLAGS += -bundle -flat_namespace -undefined suppress
endif
ifeq ($(UNAME_S),FreeBSD)
   MGDENOOS = FreeBSD
   CC = cc
   CCFLAGS += -DFREEBSD
   LINK = ld
   LINKFLAGS += -G
endif
ifeq ($(UNAME_S),AIX)
   MGDENOOS = AIX
   CC = xlc_r
   CCFLAGS += -DAIX
   LINK = xlc_r
   LINKFLAGS += -G -H512 -T512 -bM:SRE -berok -bexpall -bnoentry
endif

ifndef MGDENOOS
   $(error Cannot determine the OS type)
endif

# Build mg_deno module
all : app

# Link the object file and dependent libraries into a binary
app : mg_dba.o mg_deno.o
	$(LINK) -o mg_deno.so $(LINKFLAGS) mg_dba.o mg_deno.o

# Compile the source file into object file
mg_deno.o : mg_deno.c
	$(CC) -o mg_deno.o $(CCFLAGS) -DMG_DENO_DSO -I$(MGDENOINC) -c mg_deno.c

mg_dba.o : mg_dba.c
	$(CC) -o mg_dba.o $(CCFLAGS) -DMG_DENO_DSO -I$(MGDENOINC) -c mg_dba.c

# Install mg_deno module
install :
	cp mg_deno.so $(MGDENODIR)/mg_deno.so
	cp mg_deno.ts $(MGDENODIR)/mg_deno.ts

# Clean target
clean :
	rm -rf mg_deno.so mg_deno.o mg_dba.o
