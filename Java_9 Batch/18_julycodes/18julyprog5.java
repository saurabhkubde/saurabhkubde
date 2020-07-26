class pune {
	static int covidActivecases = 50000;
	int totalCases = 2000;

	static void noCorona(){
	
	
	}
	
	void lockdown(){
		covidActivecases++;
		totalCases++;
		System.out.println("covidactivecases="+covidActivecases);
		System.out.println("totalCases="+totalCases);

	}



}

class mumbai {
	static int covidActiveCases = 20000;
	int totalCases = 1000;

	static void nocorona() {


	}

	void lockdown() {
		covidActiveCases++;
		totalCases++;
		System.out.println("covidactivecases="+covidActiveCases);
		System.out.println("totalCases="+totalCases);



	}
	

}

class corona {


	public static void main(String[] args) {
		pune obj1 = new pune();
		mumbai obj2 = new mumbai();


		obj1.lockdown();
		obj2.lockdown();
		obj1.lockdown();
		obj2.lockdown();



	}


}

