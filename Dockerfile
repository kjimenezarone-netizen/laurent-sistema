# Despliegue del backend desde la raíz (por ejemplo, Render).
# La web React se construye con frontend/Dockerfile o de forma estática por separado.
FROM maven:3.9-eclipse-temurin-21 AS builder
WORKDIR /work/backend
COPY backend/pom.xml ./pom.xml
RUN mvn -q -DskipTests dependency:go-offline
COPY backend/src ./src
RUN mvn -q -DskipTests package
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S laurent && adduser -S laurent -G laurent && mkdir -p /app/storage && chown -R laurent:laurent /app
WORKDIR /app
COPY --from=builder /work/backend/target/*.jar app.jar
USER laurent
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
