# Use the official Maven image as the base image
FROM maven:3.8.3-jdk-20-slim as build

# Set the working directory in the container
WORKDIR /app

# Copy the pom.xml file into the container
COPY pom.xml .

# Download project dependencies
# This is done separately from copying source code to utilize Docker's caching mechanism
RUN mvn dependency:go-offline

# Copy the rest of the source code into the container
COPY src/ src/

# Build the application
RUN mvn clean install -DskipTests

# Use the official OpenJDK image as the base image for the runtime environment
FROM openjdk:11-jre-slim

# Set the working directory in the container
WORKDIR /app

# Copy the built jar file from the build image into the runtime image
COPY --from=build /app/target/myapp.jar /app/flightdash-0.0.1-SNAPSHOT.jar

# Command to run the application
CMD ["java", "-jar", "/app/flightdash-0.0.1-SNAPSHOT.jar"]
