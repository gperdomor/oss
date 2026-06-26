FROM quay.io/containers/podman:v5.8.2@sha256:b7594b0449818be37495f02f698ff98e25b888465134ff53e0d975f33a682b25
ARG NODE_VERSION
RUN dnf -y update && \
	dnf -y install \
	bash \
	bzip2 \
	curl \
	git \
	gnupg \
	gzip \
	make \
	tar \
	unzip \
	zip \
	libatomic \
	&& dnf clean all && \
	rm -rf /var/cache /var/log/dnf* /var/log/yum.*

RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.5/install.sh | bash

ENV NVM_DIR=/root/.nvm

RUN source $NVM_DIR/nvm.sh && \
	nvm install $NODE_VERSION && \
	nvm alias default $NODE_VERSION && \
	npm uninstall -g yarn pnpm && \
	npm install -g corepack@latest && \
	corepack enable && \
	corepack install -g pnpm && \
	corepack install -g yarn@1 && \
	ln -sf $NVM_DIR/versions/node/$(nvm version default)/bin/* /usr/local/bin/
