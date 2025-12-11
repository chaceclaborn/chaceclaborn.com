
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Satellite
 * 
 */
export type Satellite = $Result.DefaultSelection<Prisma.$SatellitePayload>
/**
 * Model DataUpdate
 * 
 */
export type DataUpdate = $Result.DefaultSelection<Prisma.$DataUpdatePayload>

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Satellites
 * const satellites = await prisma.satellite.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://pris.ly/d/client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Satellites
   * const satellites = await prisma.satellite.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://pris.ly/d/client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://pris.ly/d/raw-queries).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.satellite`: Exposes CRUD operations for the **Satellite** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Satellites
    * const satellites = await prisma.satellite.findMany()
    * ```
    */
  get satellite(): Prisma.SatelliteDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.dataUpdate`: Exposes CRUD operations for the **DataUpdate** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more DataUpdates
    * const dataUpdates = await prisma.dataUpdate.findMany()
    * ```
    */
  get dataUpdate(): Prisma.DataUpdateDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.1.0
   * Query Engine version: ab635e6b9d606fa5c8fb8b1a7f909c3c3c1c98ba
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Satellite: 'Satellite',
    DataUpdate: 'DataUpdate'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "satellite" | "dataUpdate"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Satellite: {
        payload: Prisma.$SatellitePayload<ExtArgs>
        fields: Prisma.SatelliteFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SatelliteFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SatellitePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SatelliteFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SatellitePayload>
          }
          findFirst: {
            args: Prisma.SatelliteFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SatellitePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SatelliteFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SatellitePayload>
          }
          findMany: {
            args: Prisma.SatelliteFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SatellitePayload>[]
          }
          create: {
            args: Prisma.SatelliteCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SatellitePayload>
          }
          createMany: {
            args: Prisma.SatelliteCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SatelliteCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SatellitePayload>[]
          }
          delete: {
            args: Prisma.SatelliteDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SatellitePayload>
          }
          update: {
            args: Prisma.SatelliteUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SatellitePayload>
          }
          deleteMany: {
            args: Prisma.SatelliteDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SatelliteUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SatelliteUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SatellitePayload>[]
          }
          upsert: {
            args: Prisma.SatelliteUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SatellitePayload>
          }
          aggregate: {
            args: Prisma.SatelliteAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSatellite>
          }
          groupBy: {
            args: Prisma.SatelliteGroupByArgs<ExtArgs>
            result: $Utils.Optional<SatelliteGroupByOutputType>[]
          }
          count: {
            args: Prisma.SatelliteCountArgs<ExtArgs>
            result: $Utils.Optional<SatelliteCountAggregateOutputType> | number
          }
        }
      }
      DataUpdate: {
        payload: Prisma.$DataUpdatePayload<ExtArgs>
        fields: Prisma.DataUpdateFieldRefs
        operations: {
          findUnique: {
            args: Prisma.DataUpdateFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataUpdatePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.DataUpdateFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataUpdatePayload>
          }
          findFirst: {
            args: Prisma.DataUpdateFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataUpdatePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.DataUpdateFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataUpdatePayload>
          }
          findMany: {
            args: Prisma.DataUpdateFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataUpdatePayload>[]
          }
          create: {
            args: Prisma.DataUpdateCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataUpdatePayload>
          }
          createMany: {
            args: Prisma.DataUpdateCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.DataUpdateCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataUpdatePayload>[]
          }
          delete: {
            args: Prisma.DataUpdateDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataUpdatePayload>
          }
          update: {
            args: Prisma.DataUpdateUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataUpdatePayload>
          }
          deleteMany: {
            args: Prisma.DataUpdateDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.DataUpdateUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.DataUpdateUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataUpdatePayload>[]
          }
          upsert: {
            args: Prisma.DataUpdateUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$DataUpdatePayload>
          }
          aggregate: {
            args: Prisma.DataUpdateAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateDataUpdate>
          }
          groupBy: {
            args: Prisma.DataUpdateGroupByArgs<ExtArgs>
            result: $Utils.Optional<DataUpdateGroupByOutputType>[]
          }
          count: {
            args: Prisma.DataUpdateCountArgs<ExtArgs>
            result: $Utils.Optional<DataUpdateCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://pris.ly/d/logging).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
    /**
     * SQL commenter plugins that add metadata to SQL queries as comments.
     * Comments follow the sqlcommenter format: https://google.github.io/sqlcommenter/
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   adapter,
     *   comments: [
     *     traceContext(),
     *     queryInsights(),
     *   ],
     * })
     * ```
     */
    comments?: runtime.SqlCommenterPlugin[]
  }
  export type GlobalOmitConfig = {
    satellite?: SatelliteOmit
    dataUpdate?: DataUpdateOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */



  /**
   * Models
   */

  /**
   * Model Satellite
   */

  export type AggregateSatellite = {
    _count: SatelliteCountAggregateOutputType | null
    _avg: SatelliteAvgAggregateOutputType | null
    _sum: SatelliteSumAggregateOutputType | null
    _min: SatelliteMinAggregateOutputType | null
    _max: SatelliteMaxAggregateOutputType | null
  }

  export type SatelliteAvgAggregateOutputType = {
    noradId: number | null
  }

  export type SatelliteSumAggregateOutputType = {
    noradId: number | null
  }

  export type SatelliteMinAggregateOutputType = {
    id: string | null
    noradId: number | null
    name: string | null
    line1: string | null
    line2: string | null
    category: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SatelliteMaxAggregateOutputType = {
    id: string | null
    noradId: number | null
    name: string | null
    line1: string | null
    line2: string | null
    category: string | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SatelliteCountAggregateOutputType = {
    id: number
    noradId: number
    name: number
    line1: number
    line2: number
    category: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SatelliteAvgAggregateInputType = {
    noradId?: true
  }

  export type SatelliteSumAggregateInputType = {
    noradId?: true
  }

  export type SatelliteMinAggregateInputType = {
    id?: true
    noradId?: true
    name?: true
    line1?: true
    line2?: true
    category?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SatelliteMaxAggregateInputType = {
    id?: true
    noradId?: true
    name?: true
    line1?: true
    line2?: true
    category?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SatelliteCountAggregateInputType = {
    id?: true
    noradId?: true
    name?: true
    line1?: true
    line2?: true
    category?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SatelliteAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Satellite to aggregate.
     */
    where?: SatelliteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Satellites to fetch.
     */
    orderBy?: SatelliteOrderByWithRelationInput | SatelliteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SatelliteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Satellites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Satellites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Satellites
    **/
    _count?: true | SatelliteCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SatelliteAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SatelliteSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SatelliteMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SatelliteMaxAggregateInputType
  }

  export type GetSatelliteAggregateType<T extends SatelliteAggregateArgs> = {
        [P in keyof T & keyof AggregateSatellite]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSatellite[P]>
      : GetScalarType<T[P], AggregateSatellite[P]>
  }




  export type SatelliteGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SatelliteWhereInput
    orderBy?: SatelliteOrderByWithAggregationInput | SatelliteOrderByWithAggregationInput[]
    by: SatelliteScalarFieldEnum[] | SatelliteScalarFieldEnum
    having?: SatelliteScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SatelliteCountAggregateInputType | true
    _avg?: SatelliteAvgAggregateInputType
    _sum?: SatelliteSumAggregateInputType
    _min?: SatelliteMinAggregateInputType
    _max?: SatelliteMaxAggregateInputType
  }

  export type SatelliteGroupByOutputType = {
    id: string
    noradId: number
    name: string
    line1: string
    line2: string
    category: string
    createdAt: Date
    updatedAt: Date
    _count: SatelliteCountAggregateOutputType | null
    _avg: SatelliteAvgAggregateOutputType | null
    _sum: SatelliteSumAggregateOutputType | null
    _min: SatelliteMinAggregateOutputType | null
    _max: SatelliteMaxAggregateOutputType | null
  }

  type GetSatelliteGroupByPayload<T extends SatelliteGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SatelliteGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SatelliteGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SatelliteGroupByOutputType[P]>
            : GetScalarType<T[P], SatelliteGroupByOutputType[P]>
        }
      >
    >


  export type SatelliteSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    noradId?: boolean
    name?: boolean
    line1?: boolean
    line2?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["satellite"]>

  export type SatelliteSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    noradId?: boolean
    name?: boolean
    line1?: boolean
    line2?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["satellite"]>

  export type SatelliteSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    noradId?: boolean
    name?: boolean
    line1?: boolean
    line2?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["satellite"]>

  export type SatelliteSelectScalar = {
    id?: boolean
    noradId?: boolean
    name?: boolean
    line1?: boolean
    line2?: boolean
    category?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SatelliteOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "noradId" | "name" | "line1" | "line2" | "category" | "createdAt" | "updatedAt", ExtArgs["result"]["satellite"]>

  export type $SatellitePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Satellite"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      noradId: number
      name: string
      line1: string
      line2: string
      category: string
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["satellite"]>
    composites: {}
  }

  type SatelliteGetPayload<S extends boolean | null | undefined | SatelliteDefaultArgs> = $Result.GetResult<Prisma.$SatellitePayload, S>

  type SatelliteCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SatelliteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: SatelliteCountAggregateInputType | true
    }

  export interface SatelliteDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Satellite'], meta: { name: 'Satellite' } }
    /**
     * Find zero or one Satellite that matches the filter.
     * @param {SatelliteFindUniqueArgs} args - Arguments to find a Satellite
     * @example
     * // Get one Satellite
     * const satellite = await prisma.satellite.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SatelliteFindUniqueArgs>(args: SelectSubset<T, SatelliteFindUniqueArgs<ExtArgs>>): Prisma__SatelliteClient<$Result.GetResult<Prisma.$SatellitePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Satellite that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SatelliteFindUniqueOrThrowArgs} args - Arguments to find a Satellite
     * @example
     * // Get one Satellite
     * const satellite = await prisma.satellite.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SatelliteFindUniqueOrThrowArgs>(args: SelectSubset<T, SatelliteFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SatelliteClient<$Result.GetResult<Prisma.$SatellitePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Satellite that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SatelliteFindFirstArgs} args - Arguments to find a Satellite
     * @example
     * // Get one Satellite
     * const satellite = await prisma.satellite.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SatelliteFindFirstArgs>(args?: SelectSubset<T, SatelliteFindFirstArgs<ExtArgs>>): Prisma__SatelliteClient<$Result.GetResult<Prisma.$SatellitePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Satellite that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SatelliteFindFirstOrThrowArgs} args - Arguments to find a Satellite
     * @example
     * // Get one Satellite
     * const satellite = await prisma.satellite.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SatelliteFindFirstOrThrowArgs>(args?: SelectSubset<T, SatelliteFindFirstOrThrowArgs<ExtArgs>>): Prisma__SatelliteClient<$Result.GetResult<Prisma.$SatellitePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Satellites that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SatelliteFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Satellites
     * const satellites = await prisma.satellite.findMany()
     * 
     * // Get first 10 Satellites
     * const satellites = await prisma.satellite.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const satelliteWithIdOnly = await prisma.satellite.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SatelliteFindManyArgs>(args?: SelectSubset<T, SatelliteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SatellitePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Satellite.
     * @param {SatelliteCreateArgs} args - Arguments to create a Satellite.
     * @example
     * // Create one Satellite
     * const Satellite = await prisma.satellite.create({
     *   data: {
     *     // ... data to create a Satellite
     *   }
     * })
     * 
     */
    create<T extends SatelliteCreateArgs>(args: SelectSubset<T, SatelliteCreateArgs<ExtArgs>>): Prisma__SatelliteClient<$Result.GetResult<Prisma.$SatellitePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Satellites.
     * @param {SatelliteCreateManyArgs} args - Arguments to create many Satellites.
     * @example
     * // Create many Satellites
     * const satellite = await prisma.satellite.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SatelliteCreateManyArgs>(args?: SelectSubset<T, SatelliteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Satellites and returns the data saved in the database.
     * @param {SatelliteCreateManyAndReturnArgs} args - Arguments to create many Satellites.
     * @example
     * // Create many Satellites
     * const satellite = await prisma.satellite.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Satellites and only return the `id`
     * const satelliteWithIdOnly = await prisma.satellite.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SatelliteCreateManyAndReturnArgs>(args?: SelectSubset<T, SatelliteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SatellitePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Satellite.
     * @param {SatelliteDeleteArgs} args - Arguments to delete one Satellite.
     * @example
     * // Delete one Satellite
     * const Satellite = await prisma.satellite.delete({
     *   where: {
     *     // ... filter to delete one Satellite
     *   }
     * })
     * 
     */
    delete<T extends SatelliteDeleteArgs>(args: SelectSubset<T, SatelliteDeleteArgs<ExtArgs>>): Prisma__SatelliteClient<$Result.GetResult<Prisma.$SatellitePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Satellite.
     * @param {SatelliteUpdateArgs} args - Arguments to update one Satellite.
     * @example
     * // Update one Satellite
     * const satellite = await prisma.satellite.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SatelliteUpdateArgs>(args: SelectSubset<T, SatelliteUpdateArgs<ExtArgs>>): Prisma__SatelliteClient<$Result.GetResult<Prisma.$SatellitePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Satellites.
     * @param {SatelliteDeleteManyArgs} args - Arguments to filter Satellites to delete.
     * @example
     * // Delete a few Satellites
     * const { count } = await prisma.satellite.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SatelliteDeleteManyArgs>(args?: SelectSubset<T, SatelliteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Satellites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SatelliteUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Satellites
     * const satellite = await prisma.satellite.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SatelliteUpdateManyArgs>(args: SelectSubset<T, SatelliteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Satellites and returns the data updated in the database.
     * @param {SatelliteUpdateManyAndReturnArgs} args - Arguments to update many Satellites.
     * @example
     * // Update many Satellites
     * const satellite = await prisma.satellite.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Satellites and only return the `id`
     * const satelliteWithIdOnly = await prisma.satellite.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SatelliteUpdateManyAndReturnArgs>(args: SelectSubset<T, SatelliteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SatellitePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Satellite.
     * @param {SatelliteUpsertArgs} args - Arguments to update or create a Satellite.
     * @example
     * // Update or create a Satellite
     * const satellite = await prisma.satellite.upsert({
     *   create: {
     *     // ... data to create a Satellite
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Satellite we want to update
     *   }
     * })
     */
    upsert<T extends SatelliteUpsertArgs>(args: SelectSubset<T, SatelliteUpsertArgs<ExtArgs>>): Prisma__SatelliteClient<$Result.GetResult<Prisma.$SatellitePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Satellites.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SatelliteCountArgs} args - Arguments to filter Satellites to count.
     * @example
     * // Count the number of Satellites
     * const count = await prisma.satellite.count({
     *   where: {
     *     // ... the filter for the Satellites we want to count
     *   }
     * })
    **/
    count<T extends SatelliteCountArgs>(
      args?: Subset<T, SatelliteCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SatelliteCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Satellite.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SatelliteAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SatelliteAggregateArgs>(args: Subset<T, SatelliteAggregateArgs>): Prisma.PrismaPromise<GetSatelliteAggregateType<T>>

    /**
     * Group by Satellite.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SatelliteGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SatelliteGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SatelliteGroupByArgs['orderBy'] }
        : { orderBy?: SatelliteGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SatelliteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSatelliteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Satellite model
   */
  readonly fields: SatelliteFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Satellite.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SatelliteClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Satellite model
   */
  interface SatelliteFieldRefs {
    readonly id: FieldRef<"Satellite", 'String'>
    readonly noradId: FieldRef<"Satellite", 'Int'>
    readonly name: FieldRef<"Satellite", 'String'>
    readonly line1: FieldRef<"Satellite", 'String'>
    readonly line2: FieldRef<"Satellite", 'String'>
    readonly category: FieldRef<"Satellite", 'String'>
    readonly createdAt: FieldRef<"Satellite", 'DateTime'>
    readonly updatedAt: FieldRef<"Satellite", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * Satellite findUnique
   */
  export type SatelliteFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Satellite
     */
    select?: SatelliteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Satellite
     */
    omit?: SatelliteOmit<ExtArgs> | null
    /**
     * Filter, which Satellite to fetch.
     */
    where: SatelliteWhereUniqueInput
  }

  /**
   * Satellite findUniqueOrThrow
   */
  export type SatelliteFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Satellite
     */
    select?: SatelliteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Satellite
     */
    omit?: SatelliteOmit<ExtArgs> | null
    /**
     * Filter, which Satellite to fetch.
     */
    where: SatelliteWhereUniqueInput
  }

  /**
   * Satellite findFirst
   */
  export type SatelliteFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Satellite
     */
    select?: SatelliteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Satellite
     */
    omit?: SatelliteOmit<ExtArgs> | null
    /**
     * Filter, which Satellite to fetch.
     */
    where?: SatelliteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Satellites to fetch.
     */
    orderBy?: SatelliteOrderByWithRelationInput | SatelliteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Satellites.
     */
    cursor?: SatelliteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Satellites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Satellites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Satellites.
     */
    distinct?: SatelliteScalarFieldEnum | SatelliteScalarFieldEnum[]
  }

  /**
   * Satellite findFirstOrThrow
   */
  export type SatelliteFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Satellite
     */
    select?: SatelliteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Satellite
     */
    omit?: SatelliteOmit<ExtArgs> | null
    /**
     * Filter, which Satellite to fetch.
     */
    where?: SatelliteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Satellites to fetch.
     */
    orderBy?: SatelliteOrderByWithRelationInput | SatelliteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Satellites.
     */
    cursor?: SatelliteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Satellites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Satellites.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Satellites.
     */
    distinct?: SatelliteScalarFieldEnum | SatelliteScalarFieldEnum[]
  }

  /**
   * Satellite findMany
   */
  export type SatelliteFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Satellite
     */
    select?: SatelliteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Satellite
     */
    omit?: SatelliteOmit<ExtArgs> | null
    /**
     * Filter, which Satellites to fetch.
     */
    where?: SatelliteWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Satellites to fetch.
     */
    orderBy?: SatelliteOrderByWithRelationInput | SatelliteOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Satellites.
     */
    cursor?: SatelliteWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Satellites from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Satellites.
     */
    skip?: number
    distinct?: SatelliteScalarFieldEnum | SatelliteScalarFieldEnum[]
  }

  /**
   * Satellite create
   */
  export type SatelliteCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Satellite
     */
    select?: SatelliteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Satellite
     */
    omit?: SatelliteOmit<ExtArgs> | null
    /**
     * The data needed to create a Satellite.
     */
    data: XOR<SatelliteCreateInput, SatelliteUncheckedCreateInput>
  }

  /**
   * Satellite createMany
   */
  export type SatelliteCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Satellites.
     */
    data: SatelliteCreateManyInput | SatelliteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Satellite createManyAndReturn
   */
  export type SatelliteCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Satellite
     */
    select?: SatelliteSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Satellite
     */
    omit?: SatelliteOmit<ExtArgs> | null
    /**
     * The data used to create many Satellites.
     */
    data: SatelliteCreateManyInput | SatelliteCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Satellite update
   */
  export type SatelliteUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Satellite
     */
    select?: SatelliteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Satellite
     */
    omit?: SatelliteOmit<ExtArgs> | null
    /**
     * The data needed to update a Satellite.
     */
    data: XOR<SatelliteUpdateInput, SatelliteUncheckedUpdateInput>
    /**
     * Choose, which Satellite to update.
     */
    where: SatelliteWhereUniqueInput
  }

  /**
   * Satellite updateMany
   */
  export type SatelliteUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Satellites.
     */
    data: XOR<SatelliteUpdateManyMutationInput, SatelliteUncheckedUpdateManyInput>
    /**
     * Filter which Satellites to update
     */
    where?: SatelliteWhereInput
    /**
     * Limit how many Satellites to update.
     */
    limit?: number
  }

  /**
   * Satellite updateManyAndReturn
   */
  export type SatelliteUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Satellite
     */
    select?: SatelliteSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Satellite
     */
    omit?: SatelliteOmit<ExtArgs> | null
    /**
     * The data used to update Satellites.
     */
    data: XOR<SatelliteUpdateManyMutationInput, SatelliteUncheckedUpdateManyInput>
    /**
     * Filter which Satellites to update
     */
    where?: SatelliteWhereInput
    /**
     * Limit how many Satellites to update.
     */
    limit?: number
  }

  /**
   * Satellite upsert
   */
  export type SatelliteUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Satellite
     */
    select?: SatelliteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Satellite
     */
    omit?: SatelliteOmit<ExtArgs> | null
    /**
     * The filter to search for the Satellite to update in case it exists.
     */
    where: SatelliteWhereUniqueInput
    /**
     * In case the Satellite found by the `where` argument doesn't exist, create a new Satellite with this data.
     */
    create: XOR<SatelliteCreateInput, SatelliteUncheckedCreateInput>
    /**
     * In case the Satellite was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SatelliteUpdateInput, SatelliteUncheckedUpdateInput>
  }

  /**
   * Satellite delete
   */
  export type SatelliteDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Satellite
     */
    select?: SatelliteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Satellite
     */
    omit?: SatelliteOmit<ExtArgs> | null
    /**
     * Filter which Satellite to delete.
     */
    where: SatelliteWhereUniqueInput
  }

  /**
   * Satellite deleteMany
   */
  export type SatelliteDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Satellites to delete
     */
    where?: SatelliteWhereInput
    /**
     * Limit how many Satellites to delete.
     */
    limit?: number
  }

  /**
   * Satellite without action
   */
  export type SatelliteDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Satellite
     */
    select?: SatelliteSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Satellite
     */
    omit?: SatelliteOmit<ExtArgs> | null
  }


  /**
   * Model DataUpdate
   */

  export type AggregateDataUpdate = {
    _count: DataUpdateCountAggregateOutputType | null
    _avg: DataUpdateAvgAggregateOutputType | null
    _sum: DataUpdateSumAggregateOutputType | null
    _min: DataUpdateMinAggregateOutputType | null
    _max: DataUpdateMaxAggregateOutputType | null
  }

  export type DataUpdateAvgAggregateOutputType = {
    totalCount: number | null
  }

  export type DataUpdateSumAggregateOutputType = {
    totalCount: number | null
  }

  export type DataUpdateMinAggregateOutputType = {
    id: string | null
    source: string | null
    totalCount: number | null
    updatedAt: Date | null
  }

  export type DataUpdateMaxAggregateOutputType = {
    id: string | null
    source: string | null
    totalCount: number | null
    updatedAt: Date | null
  }

  export type DataUpdateCountAggregateOutputType = {
    id: number
    source: number
    totalCount: number
    updatedAt: number
    _all: number
  }


  export type DataUpdateAvgAggregateInputType = {
    totalCount?: true
  }

  export type DataUpdateSumAggregateInputType = {
    totalCount?: true
  }

  export type DataUpdateMinAggregateInputType = {
    id?: true
    source?: true
    totalCount?: true
    updatedAt?: true
  }

  export type DataUpdateMaxAggregateInputType = {
    id?: true
    source?: true
    totalCount?: true
    updatedAt?: true
  }

  export type DataUpdateCountAggregateInputType = {
    id?: true
    source?: true
    totalCount?: true
    updatedAt?: true
    _all?: true
  }

  export type DataUpdateAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DataUpdate to aggregate.
     */
    where?: DataUpdateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataUpdates to fetch.
     */
    orderBy?: DataUpdateOrderByWithRelationInput | DataUpdateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: DataUpdateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataUpdates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataUpdates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned DataUpdates
    **/
    _count?: true | DataUpdateCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: DataUpdateAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: DataUpdateSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: DataUpdateMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: DataUpdateMaxAggregateInputType
  }

  export type GetDataUpdateAggregateType<T extends DataUpdateAggregateArgs> = {
        [P in keyof T & keyof AggregateDataUpdate]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateDataUpdate[P]>
      : GetScalarType<T[P], AggregateDataUpdate[P]>
  }




  export type DataUpdateGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: DataUpdateWhereInput
    orderBy?: DataUpdateOrderByWithAggregationInput | DataUpdateOrderByWithAggregationInput[]
    by: DataUpdateScalarFieldEnum[] | DataUpdateScalarFieldEnum
    having?: DataUpdateScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: DataUpdateCountAggregateInputType | true
    _avg?: DataUpdateAvgAggregateInputType
    _sum?: DataUpdateSumAggregateInputType
    _min?: DataUpdateMinAggregateInputType
    _max?: DataUpdateMaxAggregateInputType
  }

  export type DataUpdateGroupByOutputType = {
    id: string
    source: string
    totalCount: number
    updatedAt: Date
    _count: DataUpdateCountAggregateOutputType | null
    _avg: DataUpdateAvgAggregateOutputType | null
    _sum: DataUpdateSumAggregateOutputType | null
    _min: DataUpdateMinAggregateOutputType | null
    _max: DataUpdateMaxAggregateOutputType | null
  }

  type GetDataUpdateGroupByPayload<T extends DataUpdateGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<DataUpdateGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof DataUpdateGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], DataUpdateGroupByOutputType[P]>
            : GetScalarType<T[P], DataUpdateGroupByOutputType[P]>
        }
      >
    >


  export type DataUpdateSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    source?: boolean
    totalCount?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dataUpdate"]>

  export type DataUpdateSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    source?: boolean
    totalCount?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dataUpdate"]>

  export type DataUpdateSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    source?: boolean
    totalCount?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["dataUpdate"]>

  export type DataUpdateSelectScalar = {
    id?: boolean
    source?: boolean
    totalCount?: boolean
    updatedAt?: boolean
  }

  export type DataUpdateOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "source" | "totalCount" | "updatedAt", ExtArgs["result"]["dataUpdate"]>

  export type $DataUpdatePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "DataUpdate"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: string
      source: string
      totalCount: number
      updatedAt: Date
    }, ExtArgs["result"]["dataUpdate"]>
    composites: {}
  }

  type DataUpdateGetPayload<S extends boolean | null | undefined | DataUpdateDefaultArgs> = $Result.GetResult<Prisma.$DataUpdatePayload, S>

  type DataUpdateCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<DataUpdateFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
      select?: DataUpdateCountAggregateInputType | true
    }

  export interface DataUpdateDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['DataUpdate'], meta: { name: 'DataUpdate' } }
    /**
     * Find zero or one DataUpdate that matches the filter.
     * @param {DataUpdateFindUniqueArgs} args - Arguments to find a DataUpdate
     * @example
     * // Get one DataUpdate
     * const dataUpdate = await prisma.dataUpdate.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends DataUpdateFindUniqueArgs>(args: SelectSubset<T, DataUpdateFindUniqueArgs<ExtArgs>>): Prisma__DataUpdateClient<$Result.GetResult<Prisma.$DataUpdatePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one DataUpdate that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {DataUpdateFindUniqueOrThrowArgs} args - Arguments to find a DataUpdate
     * @example
     * // Get one DataUpdate
     * const dataUpdate = await prisma.dataUpdate.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends DataUpdateFindUniqueOrThrowArgs>(args: SelectSubset<T, DataUpdateFindUniqueOrThrowArgs<ExtArgs>>): Prisma__DataUpdateClient<$Result.GetResult<Prisma.$DataUpdatePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DataUpdate that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataUpdateFindFirstArgs} args - Arguments to find a DataUpdate
     * @example
     * // Get one DataUpdate
     * const dataUpdate = await prisma.dataUpdate.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends DataUpdateFindFirstArgs>(args?: SelectSubset<T, DataUpdateFindFirstArgs<ExtArgs>>): Prisma__DataUpdateClient<$Result.GetResult<Prisma.$DataUpdatePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first DataUpdate that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataUpdateFindFirstOrThrowArgs} args - Arguments to find a DataUpdate
     * @example
     * // Get one DataUpdate
     * const dataUpdate = await prisma.dataUpdate.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends DataUpdateFindFirstOrThrowArgs>(args?: SelectSubset<T, DataUpdateFindFirstOrThrowArgs<ExtArgs>>): Prisma__DataUpdateClient<$Result.GetResult<Prisma.$DataUpdatePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more DataUpdates that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataUpdateFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all DataUpdates
     * const dataUpdates = await prisma.dataUpdate.findMany()
     * 
     * // Get first 10 DataUpdates
     * const dataUpdates = await prisma.dataUpdate.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const dataUpdateWithIdOnly = await prisma.dataUpdate.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends DataUpdateFindManyArgs>(args?: SelectSubset<T, DataUpdateFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DataUpdatePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a DataUpdate.
     * @param {DataUpdateCreateArgs} args - Arguments to create a DataUpdate.
     * @example
     * // Create one DataUpdate
     * const DataUpdate = await prisma.dataUpdate.create({
     *   data: {
     *     // ... data to create a DataUpdate
     *   }
     * })
     * 
     */
    create<T extends DataUpdateCreateArgs>(args: SelectSubset<T, DataUpdateCreateArgs<ExtArgs>>): Prisma__DataUpdateClient<$Result.GetResult<Prisma.$DataUpdatePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many DataUpdates.
     * @param {DataUpdateCreateManyArgs} args - Arguments to create many DataUpdates.
     * @example
     * // Create many DataUpdates
     * const dataUpdate = await prisma.dataUpdate.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends DataUpdateCreateManyArgs>(args?: SelectSubset<T, DataUpdateCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many DataUpdates and returns the data saved in the database.
     * @param {DataUpdateCreateManyAndReturnArgs} args - Arguments to create many DataUpdates.
     * @example
     * // Create many DataUpdates
     * const dataUpdate = await prisma.dataUpdate.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many DataUpdates and only return the `id`
     * const dataUpdateWithIdOnly = await prisma.dataUpdate.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends DataUpdateCreateManyAndReturnArgs>(args?: SelectSubset<T, DataUpdateCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DataUpdatePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a DataUpdate.
     * @param {DataUpdateDeleteArgs} args - Arguments to delete one DataUpdate.
     * @example
     * // Delete one DataUpdate
     * const DataUpdate = await prisma.dataUpdate.delete({
     *   where: {
     *     // ... filter to delete one DataUpdate
     *   }
     * })
     * 
     */
    delete<T extends DataUpdateDeleteArgs>(args: SelectSubset<T, DataUpdateDeleteArgs<ExtArgs>>): Prisma__DataUpdateClient<$Result.GetResult<Prisma.$DataUpdatePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one DataUpdate.
     * @param {DataUpdateUpdateArgs} args - Arguments to update one DataUpdate.
     * @example
     * // Update one DataUpdate
     * const dataUpdate = await prisma.dataUpdate.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends DataUpdateUpdateArgs>(args: SelectSubset<T, DataUpdateUpdateArgs<ExtArgs>>): Prisma__DataUpdateClient<$Result.GetResult<Prisma.$DataUpdatePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more DataUpdates.
     * @param {DataUpdateDeleteManyArgs} args - Arguments to filter DataUpdates to delete.
     * @example
     * // Delete a few DataUpdates
     * const { count } = await prisma.dataUpdate.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends DataUpdateDeleteManyArgs>(args?: SelectSubset<T, DataUpdateDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DataUpdates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataUpdateUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many DataUpdates
     * const dataUpdate = await prisma.dataUpdate.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends DataUpdateUpdateManyArgs>(args: SelectSubset<T, DataUpdateUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more DataUpdates and returns the data updated in the database.
     * @param {DataUpdateUpdateManyAndReturnArgs} args - Arguments to update many DataUpdates.
     * @example
     * // Update many DataUpdates
     * const dataUpdate = await prisma.dataUpdate.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more DataUpdates and only return the `id`
     * const dataUpdateWithIdOnly = await prisma.dataUpdate.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends DataUpdateUpdateManyAndReturnArgs>(args: SelectSubset<T, DataUpdateUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$DataUpdatePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one DataUpdate.
     * @param {DataUpdateUpsertArgs} args - Arguments to update or create a DataUpdate.
     * @example
     * // Update or create a DataUpdate
     * const dataUpdate = await prisma.dataUpdate.upsert({
     *   create: {
     *     // ... data to create a DataUpdate
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the DataUpdate we want to update
     *   }
     * })
     */
    upsert<T extends DataUpdateUpsertArgs>(args: SelectSubset<T, DataUpdateUpsertArgs<ExtArgs>>): Prisma__DataUpdateClient<$Result.GetResult<Prisma.$DataUpdatePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of DataUpdates.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataUpdateCountArgs} args - Arguments to filter DataUpdates to count.
     * @example
     * // Count the number of DataUpdates
     * const count = await prisma.dataUpdate.count({
     *   where: {
     *     // ... the filter for the DataUpdates we want to count
     *   }
     * })
    **/
    count<T extends DataUpdateCountArgs>(
      args?: Subset<T, DataUpdateCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], DataUpdateCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a DataUpdate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataUpdateAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends DataUpdateAggregateArgs>(args: Subset<T, DataUpdateAggregateArgs>): Prisma.PrismaPromise<GetDataUpdateAggregateType<T>>

    /**
     * Group by DataUpdate.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {DataUpdateGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends DataUpdateGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: DataUpdateGroupByArgs['orderBy'] }
        : { orderBy?: DataUpdateGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, DataUpdateGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDataUpdateGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the DataUpdate model
   */
  readonly fields: DataUpdateFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for DataUpdate.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__DataUpdateClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the DataUpdate model
   */
  interface DataUpdateFieldRefs {
    readonly id: FieldRef<"DataUpdate", 'String'>
    readonly source: FieldRef<"DataUpdate", 'String'>
    readonly totalCount: FieldRef<"DataUpdate", 'Int'>
    readonly updatedAt: FieldRef<"DataUpdate", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * DataUpdate findUnique
   */
  export type DataUpdateFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataUpdate
     */
    select?: DataUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataUpdate
     */
    omit?: DataUpdateOmit<ExtArgs> | null
    /**
     * Filter, which DataUpdate to fetch.
     */
    where: DataUpdateWhereUniqueInput
  }

  /**
   * DataUpdate findUniqueOrThrow
   */
  export type DataUpdateFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataUpdate
     */
    select?: DataUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataUpdate
     */
    omit?: DataUpdateOmit<ExtArgs> | null
    /**
     * Filter, which DataUpdate to fetch.
     */
    where: DataUpdateWhereUniqueInput
  }

  /**
   * DataUpdate findFirst
   */
  export type DataUpdateFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataUpdate
     */
    select?: DataUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataUpdate
     */
    omit?: DataUpdateOmit<ExtArgs> | null
    /**
     * Filter, which DataUpdate to fetch.
     */
    where?: DataUpdateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataUpdates to fetch.
     */
    orderBy?: DataUpdateOrderByWithRelationInput | DataUpdateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DataUpdates.
     */
    cursor?: DataUpdateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataUpdates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataUpdates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DataUpdates.
     */
    distinct?: DataUpdateScalarFieldEnum | DataUpdateScalarFieldEnum[]
  }

  /**
   * DataUpdate findFirstOrThrow
   */
  export type DataUpdateFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataUpdate
     */
    select?: DataUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataUpdate
     */
    omit?: DataUpdateOmit<ExtArgs> | null
    /**
     * Filter, which DataUpdate to fetch.
     */
    where?: DataUpdateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataUpdates to fetch.
     */
    orderBy?: DataUpdateOrderByWithRelationInput | DataUpdateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for DataUpdates.
     */
    cursor?: DataUpdateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataUpdates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataUpdates.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of DataUpdates.
     */
    distinct?: DataUpdateScalarFieldEnum | DataUpdateScalarFieldEnum[]
  }

  /**
   * DataUpdate findMany
   */
  export type DataUpdateFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataUpdate
     */
    select?: DataUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataUpdate
     */
    omit?: DataUpdateOmit<ExtArgs> | null
    /**
     * Filter, which DataUpdates to fetch.
     */
    where?: DataUpdateWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of DataUpdates to fetch.
     */
    orderBy?: DataUpdateOrderByWithRelationInput | DataUpdateOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing DataUpdates.
     */
    cursor?: DataUpdateWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` DataUpdates from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` DataUpdates.
     */
    skip?: number
    distinct?: DataUpdateScalarFieldEnum | DataUpdateScalarFieldEnum[]
  }

  /**
   * DataUpdate create
   */
  export type DataUpdateCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataUpdate
     */
    select?: DataUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataUpdate
     */
    omit?: DataUpdateOmit<ExtArgs> | null
    /**
     * The data needed to create a DataUpdate.
     */
    data: XOR<DataUpdateCreateInput, DataUpdateUncheckedCreateInput>
  }

  /**
   * DataUpdate createMany
   */
  export type DataUpdateCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many DataUpdates.
     */
    data: DataUpdateCreateManyInput | DataUpdateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DataUpdate createManyAndReturn
   */
  export type DataUpdateCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataUpdate
     */
    select?: DataUpdateSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DataUpdate
     */
    omit?: DataUpdateOmit<ExtArgs> | null
    /**
     * The data used to create many DataUpdates.
     */
    data: DataUpdateCreateManyInput | DataUpdateCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * DataUpdate update
   */
  export type DataUpdateUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataUpdate
     */
    select?: DataUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataUpdate
     */
    omit?: DataUpdateOmit<ExtArgs> | null
    /**
     * The data needed to update a DataUpdate.
     */
    data: XOR<DataUpdateUpdateInput, DataUpdateUncheckedUpdateInput>
    /**
     * Choose, which DataUpdate to update.
     */
    where: DataUpdateWhereUniqueInput
  }

  /**
   * DataUpdate updateMany
   */
  export type DataUpdateUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update DataUpdates.
     */
    data: XOR<DataUpdateUpdateManyMutationInput, DataUpdateUncheckedUpdateManyInput>
    /**
     * Filter which DataUpdates to update
     */
    where?: DataUpdateWhereInput
    /**
     * Limit how many DataUpdates to update.
     */
    limit?: number
  }

  /**
   * DataUpdate updateManyAndReturn
   */
  export type DataUpdateUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataUpdate
     */
    select?: DataUpdateSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the DataUpdate
     */
    omit?: DataUpdateOmit<ExtArgs> | null
    /**
     * The data used to update DataUpdates.
     */
    data: XOR<DataUpdateUpdateManyMutationInput, DataUpdateUncheckedUpdateManyInput>
    /**
     * Filter which DataUpdates to update
     */
    where?: DataUpdateWhereInput
    /**
     * Limit how many DataUpdates to update.
     */
    limit?: number
  }

  /**
   * DataUpdate upsert
   */
  export type DataUpdateUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataUpdate
     */
    select?: DataUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataUpdate
     */
    omit?: DataUpdateOmit<ExtArgs> | null
    /**
     * The filter to search for the DataUpdate to update in case it exists.
     */
    where: DataUpdateWhereUniqueInput
    /**
     * In case the DataUpdate found by the `where` argument doesn't exist, create a new DataUpdate with this data.
     */
    create: XOR<DataUpdateCreateInput, DataUpdateUncheckedCreateInput>
    /**
     * In case the DataUpdate was found with the provided `where` argument, update it with this data.
     */
    update: XOR<DataUpdateUpdateInput, DataUpdateUncheckedUpdateInput>
  }

  /**
   * DataUpdate delete
   */
  export type DataUpdateDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataUpdate
     */
    select?: DataUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataUpdate
     */
    omit?: DataUpdateOmit<ExtArgs> | null
    /**
     * Filter which DataUpdate to delete.
     */
    where: DataUpdateWhereUniqueInput
  }

  /**
   * DataUpdate deleteMany
   */
  export type DataUpdateDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which DataUpdates to delete
     */
    where?: DataUpdateWhereInput
    /**
     * Limit how many DataUpdates to delete.
     */
    limit?: number
  }

  /**
   * DataUpdate without action
   */
  export type DataUpdateDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the DataUpdate
     */
    select?: DataUpdateSelect<ExtArgs> | null
    /**
     * Omit specific fields from the DataUpdate
     */
    omit?: DataUpdateOmit<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const SatelliteScalarFieldEnum: {
    id: 'id',
    noradId: 'noradId',
    name: 'name',
    line1: 'line1',
    line2: 'line2',
    category: 'category',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SatelliteScalarFieldEnum = (typeof SatelliteScalarFieldEnum)[keyof typeof SatelliteScalarFieldEnum]


  export const DataUpdateScalarFieldEnum: {
    id: 'id',
    source: 'source',
    totalCount: 'totalCount',
    updatedAt: 'updatedAt'
  };

  export type DataUpdateScalarFieldEnum = (typeof DataUpdateScalarFieldEnum)[keyof typeof DataUpdateScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type SatelliteWhereInput = {
    AND?: SatelliteWhereInput | SatelliteWhereInput[]
    OR?: SatelliteWhereInput[]
    NOT?: SatelliteWhereInput | SatelliteWhereInput[]
    id?: StringFilter<"Satellite"> | string
    noradId?: IntFilter<"Satellite"> | number
    name?: StringFilter<"Satellite"> | string
    line1?: StringFilter<"Satellite"> | string
    line2?: StringFilter<"Satellite"> | string
    category?: StringFilter<"Satellite"> | string
    createdAt?: DateTimeFilter<"Satellite"> | Date | string
    updatedAt?: DateTimeFilter<"Satellite"> | Date | string
  }

  export type SatelliteOrderByWithRelationInput = {
    id?: SortOrder
    noradId?: SortOrder
    name?: SortOrder
    line1?: SortOrder
    line2?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SatelliteWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    noradId?: number
    AND?: SatelliteWhereInput | SatelliteWhereInput[]
    OR?: SatelliteWhereInput[]
    NOT?: SatelliteWhereInput | SatelliteWhereInput[]
    name?: StringFilter<"Satellite"> | string
    line1?: StringFilter<"Satellite"> | string
    line2?: StringFilter<"Satellite"> | string
    category?: StringFilter<"Satellite"> | string
    createdAt?: DateTimeFilter<"Satellite"> | Date | string
    updatedAt?: DateTimeFilter<"Satellite"> | Date | string
  }, "id" | "noradId">

  export type SatelliteOrderByWithAggregationInput = {
    id?: SortOrder
    noradId?: SortOrder
    name?: SortOrder
    line1?: SortOrder
    line2?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SatelliteCountOrderByAggregateInput
    _avg?: SatelliteAvgOrderByAggregateInput
    _max?: SatelliteMaxOrderByAggregateInput
    _min?: SatelliteMinOrderByAggregateInput
    _sum?: SatelliteSumOrderByAggregateInput
  }

  export type SatelliteScalarWhereWithAggregatesInput = {
    AND?: SatelliteScalarWhereWithAggregatesInput | SatelliteScalarWhereWithAggregatesInput[]
    OR?: SatelliteScalarWhereWithAggregatesInput[]
    NOT?: SatelliteScalarWhereWithAggregatesInput | SatelliteScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"Satellite"> | string
    noradId?: IntWithAggregatesFilter<"Satellite"> | number
    name?: StringWithAggregatesFilter<"Satellite"> | string
    line1?: StringWithAggregatesFilter<"Satellite"> | string
    line2?: StringWithAggregatesFilter<"Satellite"> | string
    category?: StringWithAggregatesFilter<"Satellite"> | string
    createdAt?: DateTimeWithAggregatesFilter<"Satellite"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"Satellite"> | Date | string
  }

  export type DataUpdateWhereInput = {
    AND?: DataUpdateWhereInput | DataUpdateWhereInput[]
    OR?: DataUpdateWhereInput[]
    NOT?: DataUpdateWhereInput | DataUpdateWhereInput[]
    id?: StringFilter<"DataUpdate"> | string
    source?: StringFilter<"DataUpdate"> | string
    totalCount?: IntFilter<"DataUpdate"> | number
    updatedAt?: DateTimeFilter<"DataUpdate"> | Date | string
  }

  export type DataUpdateOrderByWithRelationInput = {
    id?: SortOrder
    source?: SortOrder
    totalCount?: SortOrder
    updatedAt?: SortOrder
  }

  export type DataUpdateWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    AND?: DataUpdateWhereInput | DataUpdateWhereInput[]
    OR?: DataUpdateWhereInput[]
    NOT?: DataUpdateWhereInput | DataUpdateWhereInput[]
    source?: StringFilter<"DataUpdate"> | string
    totalCount?: IntFilter<"DataUpdate"> | number
    updatedAt?: DateTimeFilter<"DataUpdate"> | Date | string
  }, "id">

  export type DataUpdateOrderByWithAggregationInput = {
    id?: SortOrder
    source?: SortOrder
    totalCount?: SortOrder
    updatedAt?: SortOrder
    _count?: DataUpdateCountOrderByAggregateInput
    _avg?: DataUpdateAvgOrderByAggregateInput
    _max?: DataUpdateMaxOrderByAggregateInput
    _min?: DataUpdateMinOrderByAggregateInput
    _sum?: DataUpdateSumOrderByAggregateInput
  }

  export type DataUpdateScalarWhereWithAggregatesInput = {
    AND?: DataUpdateScalarWhereWithAggregatesInput | DataUpdateScalarWhereWithAggregatesInput[]
    OR?: DataUpdateScalarWhereWithAggregatesInput[]
    NOT?: DataUpdateScalarWhereWithAggregatesInput | DataUpdateScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"DataUpdate"> | string
    source?: StringWithAggregatesFilter<"DataUpdate"> | string
    totalCount?: IntWithAggregatesFilter<"DataUpdate"> | number
    updatedAt?: DateTimeWithAggregatesFilter<"DataUpdate"> | Date | string
  }

  export type SatelliteCreateInput = {
    id?: string
    noradId: number
    name: string
    line1: string
    line2: string
    category: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SatelliteUncheckedCreateInput = {
    id?: string
    noradId: number
    name: string
    line1: string
    line2: string
    category: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SatelliteUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    noradId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    line1?: StringFieldUpdateOperationsInput | string
    line2?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SatelliteUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    noradId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    line1?: StringFieldUpdateOperationsInput | string
    line2?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SatelliteCreateManyInput = {
    id?: string
    noradId: number
    name: string
    line1: string
    line2: string
    category: string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SatelliteUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    noradId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    line1?: StringFieldUpdateOperationsInput | string
    line2?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SatelliteUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    noradId?: IntFieldUpdateOperationsInput | number
    name?: StringFieldUpdateOperationsInput | string
    line1?: StringFieldUpdateOperationsInput | string
    line2?: StringFieldUpdateOperationsInput | string
    category?: StringFieldUpdateOperationsInput | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DataUpdateCreateInput = {
    id?: string
    source: string
    totalCount: number
    updatedAt?: Date | string
  }

  export type DataUpdateUncheckedCreateInput = {
    id?: string
    source: string
    totalCount: number
    updatedAt?: Date | string
  }

  export type DataUpdateUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    totalCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DataUpdateUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    totalCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DataUpdateCreateManyInput = {
    id?: string
    source: string
    totalCount: number
    updatedAt?: Date | string
  }

  export type DataUpdateUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    totalCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type DataUpdateUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    source?: StringFieldUpdateOperationsInput | string
    totalCount?: IntFieldUpdateOperationsInput | number
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SatelliteCountOrderByAggregateInput = {
    id?: SortOrder
    noradId?: SortOrder
    name?: SortOrder
    line1?: SortOrder
    line2?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SatelliteAvgOrderByAggregateInput = {
    noradId?: SortOrder
  }

  export type SatelliteMaxOrderByAggregateInput = {
    id?: SortOrder
    noradId?: SortOrder
    name?: SortOrder
    line1?: SortOrder
    line2?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SatelliteMinOrderByAggregateInput = {
    id?: SortOrder
    noradId?: SortOrder
    name?: SortOrder
    line1?: SortOrder
    line2?: SortOrder
    category?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SatelliteSumOrderByAggregateInput = {
    noradId?: SortOrder
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type DataUpdateCountOrderByAggregateInput = {
    id?: SortOrder
    source?: SortOrder
    totalCount?: SortOrder
    updatedAt?: SortOrder
  }

  export type DataUpdateAvgOrderByAggregateInput = {
    totalCount?: SortOrder
  }

  export type DataUpdateMaxOrderByAggregateInput = {
    id?: SortOrder
    source?: SortOrder
    totalCount?: SortOrder
    updatedAt?: SortOrder
  }

  export type DataUpdateMinOrderByAggregateInput = {
    id?: SortOrder
    source?: SortOrder
    totalCount?: SortOrder
    updatedAt?: SortOrder
  }

  export type DataUpdateSumOrderByAggregateInput = {
    totalCount?: SortOrder
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}