# Cài thư viện của nestjs - thời điểm: 22/11/2024

## Cli

```bash
npm i --save-exact -g @nestjs/cli@10.4.8
```

## PosgresSQL

```bash
npm i --save-exact @nestjs/typeorm@10.0.2 typeorm@0.3.20 pg@8.13.1
```

## Nestjs configuration

```bash
npm i --save-exact @nestjs/config@3.3.0
```

## Nestjs mapped-types - Hỗ trợ kế thừa từ 1 file khác

```bash
npm i --save-exact @nestjs/mapped-types@2.0.6
```

## Validation

```bash
npm i --save-exact class-validator@0.14.1 class-transformer@0.5.1
```

## Bcrypt

```bash
npm i --save-exact bcrypt@5.1.1 @types/bcrypt
```

## UUID

```bash
npm i --save-exact uuid@11.0.3 @types/uuid@10.0.0
```

## dayjs

```bash
npm i --save-exact dayjs@1.11.13
==========================================================
dayjs('2018-08-08') // parse

dayjs().format('{YYYY} MM-DDTHH:mm:ss SSS [Z] A') // display

dayjs().set('month', 3).month() // get & set

dayjs().add(1, 'year') // manipulate

dayjs().isBefore(dayjs()) // query
```

## ms

```bash
npm i --save-exact ms@2.1.3
npm i --save-dev @types/ms@0.7.34
==========================================================
ms('2 days')  // 172800000
ms('1d')      // 86400000
ms('10h')     // 36000000
ms('2.5 hrs') // 9000000
ms('2h')      // 7200000
ms('1m')      // 60000
ms('5s')      // 5000
ms('1y')      // 31557600000
ms('100')     // 100
ms('-3 days') // -259200000
ms('-1h')     // -3600000
ms('-200')    // -200
```

## JWT

```bash
npm i --save-exact @nestjs/jwt@10.2.0 passport-jwt@4.0.1
npm i --save-dev @types/passport-jwt@4.0.1
```

## Mailer

```bash
npm i --save-exact @nestjs-modules/mailer@2.0.2 nodemailer@6.9.16 handlebars@4.7.8
npm i --save-dev @types/nodemailer
```

## Passport

```bash
npm i --save-exact @nestjs/passport@10.0.3 passport@0.7.0 passport-local@1.0.0
npm i --save-exact @types/passport-local
```

## Swagger

```bash
npm i --save-exact @nestjs/swagger@8.0.7
```

## Zod

```bash
npm i --save-exact zod@3.23.8
```

## Cache

```bash
npm i --save-exact @nestjs/cache-manager@2.2.1 cache-manager@4.1.0
```

## Redis

```bash
npm i --save-exact cache-manager-redis-store@2.0.0
npm i --save-dev @types/cache-manager-redis-store@2.0.4
```

## Multer

```bash
npm i --save-dev @types/multer@1.4.12
```

## AWS

```bash
npm i --save-exact @aws-sdk/client-s3@3.717.0
```

## throttler

- Quản lý luồng: giới hạn luồng

```bash
npm i --save-exact @nestjs/throttler@6.3.0
```

# Tạo model

- cd vào src/modules
- nest g resource nameOfModel --no-spec
