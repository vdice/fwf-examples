# Limit Access

This Spin application is designed to limit access to a given origin, until a configurable point in time has reached. Incoming requests hitting the Spin application before the desired point in time has been reached, won't be forwarded to the origin. Instead a configurable HTTP status code will be returned.


## Application Configuration

The Spin application could be configured using settings specified in the following table:

| Name | Required | Default Value | Description |
|------|----------|---------------|-------------|
| `origin` | `Yes` | none | The desired origin url |
| `block_until` | `Yes` | none | `string` representation of the UTC timestamp until inbound requests will be blocked |
| `block_status_code` | `No` | `404` | Which HTTP status code should be sent during block period |
| `track_blocked_requests` | `No` | `true` | Valid values are either `true` or `false`. If `true`, incoming requests are logged to a key value store |


## Prerequisites

To compile and run the application on your system, you must have the following installed on your system:

- The `spin` CLI
- Node.js (version `22` or later)

## Compile & Run the Spin Application

Use the `spin build` command for compiling the application:

```console
spin build
```

Use the `spin up` command for running the application: 

```console
export SPIN_VARIABLE_ORIGIN=https://fermyon.com
export SPIN_VARIABLE_BLOCK_UNTIL="Mon, 24 Feb 2025 13:56:08 GMT"
spin up
```
