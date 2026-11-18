FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build
COPY pom.xml ./
RUN mvn -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -q -DskipTests package
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S laurent && adduser -S laurent -G laurent && mkdir -p /app/storage && chown -R laurent:laurent /app
WORKDIR /app
COPY --from=build /build/target/*.jar /app/app.jar
USER laurent
EXPOSE 8080
ENTRYPOINT ["java","-XX:+TieredCompilation","-XX:TieredStopAtLevel=1","-Xms128m","-Xmx384m","-Djava.security.egd=file:/dev/./urandom","-jar","/app/app.jar"]
