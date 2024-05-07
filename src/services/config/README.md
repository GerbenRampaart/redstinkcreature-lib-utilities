After much consideration, here are the reasons I implemented my own version of the ConfigModule and not use nestjs ConfigModule.

### 1. (main reason) Type inference

Turns out that the ConfigModule assigns and retrieves all variables from process.env. Which makes sense, (even though cache: true makes the ConfigModule keep it's own in-memory collection) however this also means all values are not typed by definition. Effectively they are all Record<string, string>, like process.env. This becomes problematic when I apply a Zod schema during load(), because Zod takes the process.env and outputs typed values.

For example:
MY_VALUE: z.number().default(123); will create the output MY_VALUE: 123 and not MY_VALUE: "123". The former being actually what we want. However process.env (and the ConfigModule cache) are always Record<string, string>.
See: https://github.com/nestjs/config/blob/master/lib/config.module.ts (method 'assignVariablesToProcess').

This becomes more problematic when we want to infer the values in typescript, which is actually what makes the usage so nice.A simple get value on the ConfigService looks like this:

    get<T extends keyof TSchema>(key: T) {
    	const val: TSchema | undefined = this.cfg.get<TSchema>(key, { infer: true });
    	if (val === undefined) return undefined;
    	return val[key];
    }

Which means the user gets their property suggested when doing service.get('MY_VALUE') (also with the proper return type). However since the ConfigService uses Record<string, string>, retrieving a value that is a number will simply return undefined since it doesn't match the inferered type.

An alternative to this is going back to just making every property in the joi/zod schema a property in the ConfigService but this feels redundant and is what I was trying to solve, among other things.

### 2. Zod over Joi

I want to use Zod. I love it and there is no going back. The ConfigModule tries to be as agnostic as possible (the validationOptions are 'any') and you can trick the ConfigModule by applying a zod.parse in the load() or the validate(), but that feels a bit contrived and the ConfigModule has a dependency on joi. (not a big deal but still).

### 3. Easy reload of Config

I have encountered during many user stories, for many reasons, loading the environment settings from process.env needs to be re-done. Mostly due to an external system being maintained which steered the process.env. Sometimes the process.env was used to store semi-dynamic settings, like the app would start up with MY_PROPERTY_1 and MY_PROPERTY_2 and then later MY_PROPERTY_3 was added and we wanted to reload the process.env without restarting the running pod. So we need an easy way to re-initialize/reload the process.env and apply the schema again.

### 4. Better logging

I've always struggled a bit to get ConfigModule to exactly log the changes it made to the process.env. The default behaviour is reading .env from cwd(), however I want to inform developers better at how their zod schema impacted the values from process.env and how the dotenv impacted the values from process.env because sometimes developers in my company struggled to get that insight. I also want to use the LoggerModule to log the changes properly.

### 5. Loading a specific .env

I tend to use .env.{environment} (like 'development', 'production', 'test' and so on) and while you can supply the ConfigModule a specific path to a .dotenv to load (even an array of them), it's hard to have a specific point to have the logic to create the full .env path without using a factory function returning a DynamicModule loading the ConfigModule. Again I also want to use the LoggerModule to neatly output information about that so that LoggerService needs to be injected somewhere.
