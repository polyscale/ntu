# ntu

Network Test Utility.

## Usage

Supported Protocols:

- http/https
- tcp
- mysql
- postgres/postgresql
- mariadb
- mssql

### CLI

Requires Docker.

Options:

- `--target (-t)` – URL or URI
- `--slack-webhook (-sw)`– Slack Incoming Webhook URL for reporting results
- `--query (-q)` – SQL query for database targets

```
docker run ghcr.io/polyscale/ntu-cli
docker run ghcr.io/polyscale/ntu-cli --help
docker run ghcr.io/polyscale/ntu-cli latency --target http://host.docker.internal:3000
docker run ghcr.io/polyscale/ntu-cli load --target http://host.docker.internal:3000
```

### Worker

Requires Docker. Use environment variables to configure the worker.

```
TEST=load
URL=http://host.docker.internal:8080/demo

or

PROTOCOL=http
USERNAME=
PASSWORD=
HOSTNAME=host.docker.internal
PORT=8080
PATHNAME=/demo
SEARCH=param1=value&param2=value
QUERY=
```

```
docker run --env-file=.env ghcr.io/polyscale/ntu-worker
docker run --env TEST=latency --env URL=http://host.docker.internal:8080 ghcr.io/polyscale/ntu-worker
```

## How do the tests work?

### General

The tests measure different things depending on which protocol you are using for your target and for database protocols wether you provide a SQL query to execute. All tests include network latency.

For a single request to:
* `tcp://...`
    * the time it takes to establish a TCP connection is measured
* `[http|https]://...`
    * the time it takes to complete an HTTP request is measured
* `[mysql|mssql|mariadb|postgres]://`
    * when a query is provided the time it takes to run that query is measured. A single connection is used.
    * when no query is provided the time it take to establish a database connection is measured


### Latency Test

The latency test fires 100 queries in sequence and provides metrics based on the collected execution times.

* median – median of execution times
* P50 – 50th percentile of execution times
* P90 – 90th percentile of execution times
* P95 – 95th percentile of execution times
* P99 – 99th percentile of execution times

### Load Test

The load test fires an increasing amount of queries in parallel (`[1, 5, 20, 50, 100, 250, 500, 1000]`) in two iterations each. The test collects execution times, successful and failed request counts for each concurrency level and provides metrics based on the data.

* successMedian – median execution time of succesful requests
* successAmean – average execution time of succesful requests
* successRange – range of execution times of succesful requests
* successRequests – count of succesful requests
* errorMedian – median execution time of failed requests
* errorAmean – average execution time of failed requests
* errorRange – range of execution times of failed requests
* errorRequests – count of failed requests
* totalRequests – count of requests overall