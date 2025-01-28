# Validating Promo Codes

This Spin application illustrates how one could validate promo codes stored in a Key Value Store. 

The application exposes three endpoints:

- `POST /validate/:code` - to validate a code
- `POST /apply/:code` - to apply a code
- `POST /seed-promocodes` - to generate 50 promo codes


Each promo code has the following properties

- `Code`: The actual promo code 
- `ValidFrom`: A date when the promo code becomes valid
- `ValidTo`: A date when the promo code becomes invalid again
- `Discount`: Discount (percentage) value between 0.00 and 0.35
- `Used`: A boolean that will be toggled if the code has already been applied


## Validation Logic

- A promo code could only be applied once 
- A promo code is neither valid nor could it be applied if `ValidFrom` has not been reached
- A promo code is neither valid nor could it be applied if `ValidTo` has passed

## Running the Spin App on your local machine

Compile the application by running `spin build`. Once compilation has finished, run the app with `spin up`:

```console
spin build
spin up
```

## Generating Promo Codes

To generate promo codes, send a `POST` request to `/seed-promocodes`:

```console
curl -iX POST http://localhost:3000/seed-promocodes

HTTP/1.1 201 Created
content-type: application/json
content-length: 8408
date: Fri, 24 Jan 2025 14:51:10 GMT

[
  {
    "code": "83435dd4-6226-4d6c-afd4-2eb2cb7547d6",
    "validFrom": "2025-02-14T00:00:00Z",
    "validTo": "2025-08-14T00:00:00Z",
    "discount": 0.2684043
  },
   ...
]
```

The command above, will generate 50 random promo codes and store them in Key-Value Store. Additionally, all promo codes and their metadata will be returned as HTTP response (JSON).

## Validating a Promo Code

Grab different UUIDs from the response received in the previous step and send a `POST` request to `/validate/:code`:

```console
curl -iX POST http://localhost:3000/validate/0cde9a1e-09b4-4089-ab56-01c6f76ac31d
HTTP/1.1 200 OK
content-type: application/json
content-length: 114
date: Fri, 24 Jan 2025 15:09:30 GMT

{
  "code": "0cde9a1e-09b4-4089-ab56-01c6f76ac31d",
  "isValid": true,
  "reason": "",
  "discount": 0.33410984
}
```

## Apply a Promo Code

Once you found a valid promo code, apply it by sending another `POST` request, this time, use the `/apply/:code` route:

```console
curl -iX POST http://localhost:3000/apply/0cde9a1e-09b4-4089-ab56-01c6f76ac31d
HTTP/1.1 200 OK
content-type: application/json
content-length: 114
date: Fri, 24 Jan 2025 15:09:37 GMT

{
  "code": "0cde9a1e-09b4-4089-ab56-01c6f76ac31d",
  "isValid": true,
  "discount": 0.33410984
}
```

Once applied, you can try re-validating and re-applying to verify the code is treated as invalid. 
