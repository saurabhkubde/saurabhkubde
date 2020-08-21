import java.io.*;

class pattern {
	public static void main(String[] args) throws IOException {
		InputStreamReader isr = new InputStreamReader(System.in);
		BufferedReader br = new BufferedReader(isr); 

		int age = Integer.parseInt(br.readLine());
		
		for(int i=1;i<=age;i++){
			for(int j=1;j<=age;j++){
				System.out.print(j*2+" ");
			}
			System.out.println("\n");
		}


		}

}	
		

