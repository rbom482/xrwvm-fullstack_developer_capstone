# Use the official Python image from the Docker Hub
FROM python:3.12.0-slim-bookworm

# Set environment variables
ENV PYTHONBUFFERED=1
ENV PYTHONWRITEBYTECODE=1
ENV APP=/app

# Change the working directory to /app
WORKDIR $APP

# Copy the requirements.txt file into the container
COPY requirements.txt $APP

# Install the dependencies specified in requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy the rest of the application files into the container
COPY . $APP

# Expose the port that the application will run on
EXPOSE 8000

# Make the entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Set the entrypoint to the entrypoint script
ENTRYPOINT ["/bin/bash", "/app/entrypoint.sh"]

# Command to run the application
CMD ["gunicorn", "--bind", ":8000", "--workers", "3", "djangoproj.wsgi:application"]