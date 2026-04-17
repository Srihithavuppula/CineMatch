// @Configuration
//public class TestRunner {

//    @Bean
//    public CommandLineRunner testDatabase(MovieRepository movieRepository) {
//        return args -> {
//            System.out.println("===== DATABASE TEST START =====");
//
//            long count = movieRepository.count();
//            System.out.println("Total Movies in DB: " + count);
//
//            movieRepository.findAll().forEach(movie -> {
//                System.out.println("Movie: " + movie.getTitle());
//            });
//
//            System.out.println("===== DATABASE TEST END =====");
//        };
//    }

//}