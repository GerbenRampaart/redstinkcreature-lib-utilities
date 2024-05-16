FROM denoland/deno:latest

RUN mkdir -p /app/src
WORKDIR /app

COPY ./src ./src
COPY ./deno.json .
COPY ./deno.lock .

RUN cd ./src && deno cache main.ts

ENV DENO_ENV=production
CMD [ "deno", "run", "--allow-all", "--cached-only", "./src/main.ts" ]

# docker buildx build . --progress=plain -t lib-utilities:latest
# docker run -it -p 3000:3000 lib-utilities:latest