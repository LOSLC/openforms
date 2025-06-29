# syntax=docker/dockerfile:1.6   # enables BuildKit cache mounts

########################
# ---- Build stage ----
########################
FROM python:3.13-slim-bookworm AS builder

# 1. System deps (build‑only)
RUN pip3 install --no-cache-dir uv

# 2. Non‑root user
RUN useradd -m runner
USER runner
WORKDIR /home/runner/app
COPY --chown=runner:runner . .

# 3. Virtual‑env lives in /opt/venv so it’s easy to copy
RUN python3 -m venv .venv
# 5. Install deps (optionally cache the wheelhouse)
#    Uncomment the --mount line if you build with BuildKit
RUN uv sync

############################
# ---- Runtime stage ----
############################
FROM python:3.13-slim-bookworm AS production

RUN apt-get update && apt-get install -y acl
RUN pip install uv

# 2. Non‑root runtime user
RUN useradd -m runner
USER runner
WORKDIR /home/runner/app
COPY --chown=runner:runner --from=builder /home/runner/app ./

EXPOSE 8000
CMD ["bash", "./entry.bash"]
