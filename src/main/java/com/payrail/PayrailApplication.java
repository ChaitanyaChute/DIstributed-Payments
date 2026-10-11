package com.payrail;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Entry point. @SpringBootApplication = component scan + auto-config + @Configuration.
 * Equivalent to "const app = express(); app.listen(8080)" in Node.
 */
@SpringBootApplication
@EnableTransactionManagement
@EnableAsync
@EnableRetry
public class PayrailApplication {
    public static void main(String[] args) {
        SpringApplication.run(PayrailApplication.class, args);
    }
}
