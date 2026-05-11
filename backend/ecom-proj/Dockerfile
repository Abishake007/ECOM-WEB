# Stage 1: Build the application
FROM maven:3.9.9-eclipse-temurin-24 AS build
WORKDIR /app

# Copy pom.xml and download dependencies (cached layer)
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code and build the jar
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:24-jre-alpine
WORKDIR /app

# Copy the built jar from the build stage
COPY --from=build /app/target/ecom-proj-*.jar app.jar

# Set environment variables (Defaults for local, override in Render)
ENV PORT=8080
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]