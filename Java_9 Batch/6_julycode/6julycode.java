
class teacher{
	static int noofteacher = 1000;
	  int noofstudent = 20000;

	static void tech() {
		System.out.println("no of teacher:"+noofteacher);
	}
	
	void subject() {
		System.out.println("no of student:"+noofstudent);
	}

}
class student{
        static int noofteacher = 2000;
          int noofstudent = 20000;
          
        static void learn() {
                System.out.println("no of teacher:"+noofteacher);
        }

        void giveexam() {
                System.out.println("no of student:"+noofstudent);
        }

}

class college{

	public static void main(String[] args){
		teacher t1 = new teacher();
		t1.noofstudent = 3000;
		t1.tech();
		t1.subject(); 

		teacher t2 = new teacher();
                t2.noofstudent = 5000;
                t2.tech();
                t2.subject();


		student s1 = new student();
		s1.noofstudent = 6000;
		s1.learn();
		s1.giveexam();

		student s2 = new student();
                s2.noofstudent = 7000;
                s2.learn();
                s2.giveexam();

	}

}


