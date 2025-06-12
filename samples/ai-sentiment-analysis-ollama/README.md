# AI Sentiment Analysis (Ollama Edition)

This sample illustrates how to build an AI Sentiment Analysis using a configurable Large Language Model (LLM) hosted on Ollama.

The Spin App consists of three different components:

- A HTML5 Frontend served using the static fileserver Wasm component for Spin
- A HTTP API implemented using TypeScript and LangChain.js
- The Key-Value Explorer to examine persisted sentiment analysis

## Configuration Variables

See all available configuration variables in the following table:

| Variable Name | Data Type | Required | Default | Description |
|---------------|-----------|----------|---------|-------------|
| `ollama_api_url` | `string` | `yes` | `` | Root URL of your Ollama Server (e.g., `http://1.1.1.1:11434/`) |
| `ollama_model_identifier` | `string` | `no` | `llama3.2:latest` | Identifier of your LLM running on Ollama |
| `kv_explorer_user` | `string` | `yes` | `` | The username for accessing the Key-Value explorer |
| `kv_explorer_password` | `string` | `yes` | `` | The password for accessing the Key-Value explorer |

## Building the Application

You can build the application by invoking `spin build`.

## Running the Application on your local machine

To run the application, specify the required variables and invoke `spin up`:

```bash
export SPIN_VARIABLE_ollama_api_url=http://0.0.0.0:11434/
export SPIN_VARIABLE_ollama_model_identifier=llama3.2:latest
export SPIN_VARIABLE_kv_explorer_user=bob
export SPIN_VARIABLE_kv_explorer_password=secret

spin up
```

## Deploying to Fermyon Wasm Functions

Once authenticated (`spin aka login`), you can deploy the application using the `spin aka deploy` command. Required variables must be specified using the `--variable` flag:

```bash
spin aka deploy \
  --variable ollama_api_url="http://0.0.0.0:11434/" \
  --variable ollama_model_identifier="llama3.2:latest" \
  --variable kv_explorer_user="bob" \
  --variable kv_explorer_password="secret"
```