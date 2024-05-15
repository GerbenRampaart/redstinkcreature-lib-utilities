FROM denoland/deno:latest

RUN mkdir -p /app/src

COPY ./src /app/src
COPY ./deno.json /app
COPY ./deno.lock /app

RUN cd /app/src && deno cache main.ts

ENV DENO_ENV=production
CMD [ "deno", "run", "--allow-all", "--cached-only", "/app/src/main.ts" ]

# docker buildx build . --progress=plain -t lib-utilities:latest
# docker run -it -p 3000:3000 lib-utilities:latest